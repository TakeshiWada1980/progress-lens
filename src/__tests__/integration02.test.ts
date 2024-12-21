// 1名の教員を作成
//   1個のセッションを作成。科目には2個の設問を登録
// 2名の学生を作成, それぞれがセッションに参加

import UserService, {
  forGetStudentsBySessionIdSchema,
} from "@/app/_services/userService";
import SessionService, {
  forEditSessionSchema,
  forSnapshotSessionSchema,
} from "@/app/_services/sessionService";
import QuestionService from "@/app/_services/questionService";
import { Prisma as PRS } from "@prisma/client";
import { Role } from "@/app/_types/UserTypes";
import { v4 as uuid } from "uuid";
import { PrismaClient } from "@prisma/client";
import exp from "constants";

interface SessionSeed {
  id?: string;
  title: string;
  accessCode?: string;
}

interface TeacherSeed {
  id?: string;
  displayName: string;
  sessions: SessionSeed[];
}

interface StudentSeed {
  id?: string;
  displayName: string;
}

const studentWithEnrollmentsSchema = {
  include: {
    student: {
      include: {
        enrollments: true,
      },
    },
  },
} as const;

const testUserIdPrefix = "TEST-I02-";
const fabricateTestUserId = () => testUserIdPrefix + uuid().substring(0, 8);
const Timeout = 30 * 1000;

describe("設問回答に関する機能テスト", () => {
  let prisma: PrismaClient;
  let userService: UserService;
  let sessionService: SessionService;
  let questionService: QuestionService;

  let teachers: TeacherSeed[] = [{ displayName: "高負荷 耐子", sessions: [] }];
  let students: StudentSeed[] = [
    { displayName: "構文 誤次郎" },
    { displayName: "仕様 曖昧子" },
    { displayName: "保守 絶望太" },
  ];

  beforeAll(async () => {
    prisma = new PrismaClient();
    userService = new UserService(prisma);
    sessionService = new SessionService(prisma);
    questionService = new QuestionService(prisma);
    teachers.forEach((teacher) => (teacher.id = fabricateTestUserId()));
    students.forEach((student) => (student.id = fabricateTestUserId()));
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { startsWith: testUserIdPrefix } },
    });
  });

  describe("ユーザ（学生ロール）の新規作成", () => {
    it(
      "成功する",
      async () => {
        const users = [...teachers, ...students];
        const createdUsers = await Promise.all(
          users.map(({ id, displayName }) =>
            userService.createAsStudent(id!, displayName)
          )
        );
        createdUsers.forEach((user) => expect(user.role).toBe(Role.STUDENT));
      },
      Timeout
    );
  });

  describe("指定ユーザの教員ロール昇格", () => {
    it(
      "教員ロールへの昇格に成功した",
      async () => {
        const updatedUsers = await Promise.all(
          teachers.map(({ id }) => userService.updateRole(id!, Role.TEACHER))
        );
        updatedUsers.forEach((user) => expect(user.role).toBe(Role.TEACHER));
      },
      Timeout
    );
  });

  describe("教員（高負荷 耐子）がLSを新規作成", () => {
    //prettier-ignore
    it("成功する", async () => {
        const teacher = teachers[0];
        teacher.sessions.push(
          { title: "プログラミング基礎演習（第01回）"},
        );

        for (const session of teacher.sessions) {
          //prettier-ignore
          const createdSession = await sessionService.create(teacher.id!, session.title);
          session.id = createdSession.id;
          session.accessCode = createdSession.accessCode;
          expect(createdSession.title).toBe(session.title);
          expect(createdSession.accessCode).toBe(session.accessCode);
          // console.log(`セッション ${createdSession.title} (${createdSession.accessCode}) を作成`);
        }
      },
      Timeout
    );
  });

  describe("設問を追加する", () => {
    it(
      "成功する",
      async () => {
        const teacher = teachers[0];
        const session = teacher.sessions[0];
        await questionService.create(session.id!, 2, "設問2");
      },
      Timeout
    );
  });

  describe("学生をセッションに参加させる処理(デフォルトレスポンスも登録)", () => {
    it(
      "成功する",
      async () => {
        const teacher = teachers[0]; // [教員] 高負荷 耐子
        const session = teacher.sessions[0];
        const studentToUnenroll = students[1];

        async function enrollAllStudents() {
          await Promise.all(
            students.map((student) =>
              sessionService.enrollStudent(session.id!, student.id!)
            )
          );
        }

        async function getEnrolledStudentIds(includeDeleted: boolean) {
          const enrolledStudents = await userService.getStudentsBySessionId(
            session.id!,
            includeDeleted,
            forGetStudentsBySessionIdSchema
          );
          return new Set<string>(
            enrolledStudents.map((student) => student.userId)
          );
        }

        function getAllStudentIds() {
          return new Set<string>(students.map((student) => student.id!));
        }

        // テストの実行
        await enrollAllStudents();

        // 全学生の参加を確認
        let expectedStudentIds = getAllStudentIds();
        let actualStudentIds = await getEnrolledStudentIds(false);
        expect(actualStudentIds).toEqual(expectedStudentIds);

        // 学生を1名セッションから削除
        await sessionService.unenrollStudent(
          session.id!,
          studentToUnenroll.id!
        );

        // 削除済み学生を含めた取得の確認
        actualStudentIds = await getEnrolledStudentIds(true);
        expect(actualStudentIds).toEqual(expectedStudentIds);

        // 削除済み学生を除外した取得の確認
        expectedStudentIds.delete(studentToUnenroll.id!);
        actualStudentIds = await getEnrolledStudentIds(false);
        expect(actualStudentIds).toEqual(expectedStudentIds);
      },
      Timeout
    );
  });

  describe("レスポンスが登録されていることを確認", () => {
    it(
      "成功する",
      async () => {
        const teacher = teachers[0];
        const accessCode = teacher.sessions[0].accessCode!;
        const session = (await sessionService.getByAccessCode(
          accessCode,
          forSnapshotSessionSchema
        )) as PRS.LearningSessionGetPayload<typeof forSnapshotSessionSchema>;

        students.forEach(async (student) => {
          const x = await userService.getResponses(student.id!);
          expect(x.length).toEqual(session.questions.length);
        });
      },
      Timeout
    );
  });

  describe("参加学生のデフォルトレスポンス登録を確認", () => {
    it("成功する", async () => {
      const teacher = teachers[0];
      const accessCode = teacher.sessions[0].accessCode!;
      const session = (await sessionService.getByAccessCode(
        accessCode,
        forSnapshotSessionSchema
      )) as PRS.LearningSessionGetPayload<typeof forSnapshotSessionSchema>;

      // console.log(JSON.stringify(session, null, 2));

      session.questions.forEach((question) => {
        expect(students.length).toBe(
          question.options.find((o) => o.id === question.defaultOptionId)
            ?._count.responses
        );
      }, Timeout);
    });
  });

  describe("設問を削除する", () => {
    it(
      "成功する",
      async () => {
        const teacher = teachers[0];
        const sessions = (await sessionService.getAllByTeacherId(
          teacher.id!,
          forEditSessionSchema
        )) as PRS.LearningSessionGetPayload<typeof forEditSessionSchema>[];
        const deleteQuestionId = sessions[0].questions[1].id;
        await questionService.delete(deleteQuestionId);
      },
      Timeout
    );
  });

  describe("レスポンスが削除されることを確認する", () => {
    it(
      "成功する",
      async () => {
        const teacher = teachers[0];
        const accessCode = teacher.sessions[0].accessCode!;
        const session = (await sessionService.getByAccessCode(
          accessCode,
          forSnapshotSessionSchema
        )) as PRS.LearningSessionGetPayload<typeof forSnapshotSessionSchema>;

        students.forEach(async (student) => {
          const x = await userService.getResponses(student.id!);
          expect(x.length).toEqual(session.questions.length);
        });
      },
      Timeout
    );
  });

  describe("設問を追加する", () => {
    it(
      "成功する",
      async () => {
        const teacher = teachers[0];
        const session = teacher.sessions[0];
        await questionService.create(session.id!, 3, "設問3");
      },
      Timeout
    );
  });

  // describe("追加された設問に対して、全学生のデフォルトレスポンスをされてることを確認", () => {
  //   it("成功する", async () => {
  //     const teacher = teachers[0];
  //     const accessCode = teacher.sessions[0].accessCode!;
  //     const session = (await sessionService.getByAccessCode(
  //       accessCode,
  //       forResponseSessionSchema
  //     )) as PRS.LearningSessionGetPayload<typeof forResponseSessionSchema>;

  //     console.log(JSON.stringify(session, null, 2));

  //     session.questions.forEach((question) => {
  //       expect(students.length).toBe(
  //         question.options.find((o) => o.id === question.defaultOptionId)
  //           ?._count.responses
  //       );
  //     }, Timeout);
  //   });
  // });

  // describe("参加学生のレスポンスを登録", () => {
  //   it(
  //     "成功する",
  //     async () => {
  //       const teacher = teachers[0];
  //       const sessions = (await sessionService.getAllByTeacherId(
  //         teacher.id!,
  //         forEditSessionSchema
  //       )) as PRS.LearningSessionGetPayload<typeof forEditSessionSchema>[];
  //       const questions = sessions[0].questions;
  //       // console.log(JSON.stringify(questions, null, 2));

  //       const sessionId = sessions[0].id;
  //       const accessCode = sessions[0].accessCode;
  //       const questionId = questions[0].id;
  //       const defaultOptionId = questions[0].defaultOptionId!;

  //       await Promise.all(
  //         students.map((student) =>
  //           questionService.upsertResponse(
  //             student.id!,
  //             sessionId,
  //             questionId,
  //             defaultOptionId
  //           )
  //         )
  //       );

  //       let updatedSession = (await sessionService.getByAccessCode(
  //         accessCode,
  //         forResponseSessionSchema
  //       )) as PRS.LearningSessionGetPayload<typeof forResponseSessionSchema>;

  //       expect(students.length).toBe(
  //         updatedSession.questions[0].options.find(
  //           (o) => o.id === defaultOptionId
  //         )?._count.responses
  //       );

  //       // console.log(JSON.stringify(updatedSession, null, 2));

  //       // 学生1名の回答を変更
  //       const targetStudent = students[0];
  //       const newOptionId = questions[0].options[2].id;
  //       await questionService.upsertResponse(
  //         targetStudent.id!,
  //         sessionId,
  //         questionId,
  //         newOptionId
  //       );

  //       updatedSession = (await sessionService.getByAccessCode(
  //         accessCode,
  //         forResponseSessionSchema
  //       )) as PRS.LearningSessionGetPayload<typeof forResponseSessionSchema>;

  //       // デフォルトオプションの選択は1個減るはず
  //       expect(students.length - 1).toBe(
  //         updatedSession.questions[0].options.find(
  //           (o) => o.id === defaultOptionId
  //         )?._count.responses
  //       );

  //       // 新しいオプションの選択は1個増えるはず
  //       expect(1).toBe(
  //         updatedSession.questions[0].options.find((o) => o.id === newOptionId)
  //           ?._count.responses
  //       );
  //     },
  //     Timeout
  //   );
  // });
});
