import UserService from "@/app/_services/userService";
import SessionService, {
  forGetAllByTeacherIdSchema,
} from "@/app/_services/sessionService";
import { Prisma as PRS } from "@prisma/client";
import { Role } from "@/app/_types/UserTypes";
import { v4 as uuid } from "uuid";
import { PrismaClient } from "@prisma/client";

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

const testUserIdPrefix = "TEST-I01-";
const fabricateTestUserId = () => testUserIdPrefix + uuid().substring(0, 8);
const Timeout = 30 * 1000;

describe("教員のLS作成と取得、学生のLS参加と取得のテスト", () => {
  let prisma: PrismaClient;
  let userService: UserService;
  let sessionService: SessionService;

  let teachers: TeacherSeed[] = [
    { displayName: "高負荷 耐子", sessions: [] },
    { displayName: "不具合 直志", sessions: [] },
    { displayName: "凝集 高夫", sessions: [] },
  ];
  let students: StudentSeed[] = [
    { displayName: "構文 誤次郎" },
    { displayName: "仕様 曖昧子" },
    { displayName: "保守 絶望太" },
    { displayName: "負債 雪崩美" },
  ];

  beforeAll(async () => {
    prisma = new PrismaClient();
    userService = new UserService(prisma);
    sessionService = new SessionService(prisma);
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

  describe("教員0（高負荷 耐子）がLSを新規", () => {
    //prettier-ignore
    it("成功する", async () => {
        const teacher = teachers[0];
        teacher.sessions.push(
          { title: "プログラミング基礎演習（第01回）"},
          { title: "プログラミング基礎演習（第02回）"},
          { title: "プログラミング基礎演習（第03回）"}
        );
        // あえて1.1秒のウエイトを入れて追加
        for (const session of teacher.sessions) {
          await new Promise((resolve) => setTimeout(resolve, 1100));
          //prettier-ignore
          const createdSession = await sessionService.create(
            teacher.id!, session.title );
          session.id = createdSession.id;
          session.accessCode = createdSession.accessCode;
          expect(createdSession.title).toBe(session.title);
          expect(createdSession.accessCode).toBe(session.accessCode);
        }
      },
      Timeout
    );
  });

  describe("教員1（不具合 直志）がLSを新規", () => {
    //prettier-ignore
    it("成功する", async () => {
        const teacher = teachers[1];
        teacher.sessions.push(
          { title: "データベース工学（第03回）"},
          { title: "データベース工学（第05回）"},
          { title: "データベース工学（第07回）"},
          { title: "データベース工学（第14回）"},
        );
        // ここでは追加順序が意味を持つので Promise.all は使わない
        for (const session of teacher.sessions) {
          //prettier-ignore
          const createdSession = await sessionService.create(
            teacher.id!, session.title );
          session.id = createdSession.id;
          session.accessCode = createdSession.accessCode;
          expect(createdSession.title).toBe(session.title);
          expect(createdSession.accessCode).toBe(session.accessCode);
          // await new Promise((resolve) => setTimeout(resolve, 1100));
        }
      },
      Timeout
    );
  });

  if (true) {
    describe("全てのLSの一覧（日付 desc [新]→[旧] の順番）の取得", () => {
      //prettier-ignore
      it("成功する", async () => {
        // 引数省略すると updatedAtが 降順（Desc）新しい日付から古い日付になる
        const sessions = await sessionService.getAll();
        
        expect(sessions).toEqual([...sessions].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
      }
    );
    });

    describe("全てのLSの一覧（日付 asc [旧]→[新] の順番）の取得", () => {
      //prettier-ignore
      it("成功する", async () => {
        const sessions = await sessionService.getAll(undefined,"updatedAt", "asc");
        expect(sessions).toEqual([...sessions].sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()));
      }
    );
    });

    describe("全てのLSの一覧（タイトル昇順）の取得", () => {
      //prettier-ignore
      it("成功する", async () => {
        const sessions = await sessionService.getAll(undefined,"title", "asc"); 
        expect(sessions).toEqual([...sessions].sort((a, b) => a.title.localeCompare(b.title)));
      }
    );
    });

    describe("全てのLSの一覧（タイトル降順）の取得", () => {
      //prettier-ignore
      it("成功する", async () => {
        const sessions = await sessionService.getAll(undefined,"title", "desc"); 
        expect(sessions).toEqual([...sessions].sort((a, b) => b.title.localeCompare(a.title)));
      }
    );
    });
  }

  describe("教員0（高負荷 耐子）のLSの取得", () => {
    // prettier-ignore
    it("成功する", async () => {
      const teacher = teachers[0];
      // 引数省略すると updatedAtが 降順（Desc）新しい日付から古い日付になる
      const sessions = await sessionService.getAllByTeacherId(teacher.id!);
      expect(sessions.length).toBe(teacher.sessions.length);
      expect(sessions).toEqual([...sessions].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));      
    });
  });

  describe("教員1（不具合 直志）のLSの取得", () => {
    // prettier-ignore
    it("成功する", async () => {
      const teacher = teachers[1];
      const sessions = await sessionService.getAllByTeacherId(teacher.id!);
      console.log(sessions);
      expect(sessions.length).toBe(teacher.sessions.length);
      expect(sessions).toEqual([...sessions].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));      
    });
  });

  describe("学生0（構文 誤次郎）がLSに参加", () => {
    it(
      "成功する",
      async () => {
        const student = students[0]; // [学生] 構文 誤次郎
        // 全ての教員のセッションに参加
        await Promise.all(
          // flatMap を使用すること
          teachers.flatMap((teacher) =>
            teacher.sessions.map((session) =>
              sessionService.enrollStudent(session.id!, student.id!)
            )
          )
        );

        // sessionIdsSet0 は、登録した「はず」のセッションID（セット）
        const expectedIdSet = new Set<string>(
          teachers.flatMap((teacher) =>
            teacher.sessions.map((session) => session.id!)
          )
        );

        // StudentId をキーにセッションを取得
        const sessions = await sessionService.getAllByStudentId(student.id!);
        const actualIdSet1 = new Set<string>(
          sessions.map((session) => session.id!)
        );
        expect(actualIdSet1).toEqual(expectedIdSet);

        // Student に Session が紐づいていることを確認
        const fetchedStudent = (await userService.getById(
          student.id!,
          studentWithEnrollmentsSchema
        )) as PRS.UserGetPayload<typeof studentWithEnrollmentsSchema>;
        const actualIdSet2 = new Set<string>(
          fetchedStudent.student?.enrollments.map(
            (enrollment) => enrollment.sessionId
          )
        );
        expect(actualIdSet2).toEqual(expectedIdSet);
      },
      Timeout
    );
  });

  // NOTE: テストコードの重複は、とりあえず許容
  describe("学生1（仕様 曖昧子）がLSに参加", () => {
    it(
      "成功する",
      async () => {
        const student = students[1]; // [学生] 仕様 曖昧子
        const teacher = teachers[0]; // [教員] 高負荷 耐子
        // 教員0（高負荷 耐子）のセッションだけに参加
        await Promise.all(
          teacher.sessions.map((session) =>
            sessionService.enrollStudent(session.id!, student.id!)
          )
        );

        const expectedIdSet = new Set<string>(
          teacher.sessions.map((session) => session.id!)
        );

        const sessions = await sessionService.getAllByStudentId(student.id!);
        const actualIdSet1 = new Set<string>(
          sessions.map((session) => session.id!)
        );
        expect(actualIdSet1).toEqual(expectedIdSet);

        const fetchedStudent = (await userService.getById(
          student.id!,
          studentWithEnrollmentsSchema
        )) as PRS.UserGetPayload<typeof studentWithEnrollmentsSchema>;
        const actualIdSet2 = new Set<string>(
          fetchedStudent.student?.enrollments.map(
            (enrollment) => enrollment.sessionId
          )
        );
        expect(actualIdSet2).toEqual(expectedIdSet);
      },
      Timeout
    );
  });

  // NOTE: テストコードの重複は、とりあえず許容
  describe("学生2（保守 絶望太）がLSに参加", () => {
    it(
      "成功する",
      async () => {
        const student = students[2]; // [学生] 保守 絶望太
        const teacher = teachers[1]; // [教員] 不具合 直志
        // 教員2（不具合 直志）のセッションだけに参加
        await Promise.all(
          teacher.sessions.map((session) =>
            sessionService.enrollStudent(session.id!, student.id!)
          )
        );

        const expectedIdSet = new Set<string>(
          teacher.sessions.map((session) => session.id!)
        );

        const sessions = await sessionService.getAllByStudentId(student.id!);
        const actualIdSet1 = new Set<string>(
          sessions.map((session) => session.id!)
        );
        expect(actualIdSet1).toEqual(expectedIdSet);

        const fetchedStudent = (await userService.getById(
          student.id!,
          studentWithEnrollmentsSchema
        )) as PRS.UserGetPayload<typeof studentWithEnrollmentsSchema>;
        const actualIdSet2 = new Set<string>(
          fetchedStudent.student?.enrollments.map(
            (enrollment) => enrollment.sessionId
          )
        );
        expect(actualIdSet2).toEqual(expectedIdSet);
      },
      Timeout
    );
  });

  describe("学生3（負債 雪崩美）は、いずれのLSにも未参加", () => {
    it(
      "成功する",
      async () => {
        const student = students[3]; // [学生] 負債 雪崩美
        const expectedIdSet = new Set<string>([]);

        const sessions = await sessionService.getAllByStudentId(student.id!);
        const actualIdSet1 = new Set<string>(
          sessions.map((session) => session.id!)
        );
        expect(actualIdSet1).toEqual(expectedIdSet);

        const fetchedStudent = (await userService.getById(
          student.id!,
          studentWithEnrollmentsSchema
        )) as PRS.UserGetPayload<typeof studentWithEnrollmentsSchema>;
        const actualIdSet2 = new Set<string>(
          fetchedStudent.student?.enrollments.map(
            (enrollment) => enrollment.sessionId
          )
        );
        expect(actualIdSet2).toEqual(expectedIdSet);
      },
      Timeout
    );
  });

  describe("教員0（高負荷 耐子）のLS（参加数）の取得", () => {
    // prettier-ignore
    it("成功する", async () => {
      const teacher = teachers[0];
      // 引数省略すると updatedAtが 降順（Desc）新しい日付から古い日付になる
      const sessions = await sessionService.getAllByTeacherId(teacher.id!,forGetAllByTeacherIdSchema);
      expect(sessions.length).toBe(teacher.sessions.length);
      expect(sessions).toEqual([...sessions].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
      sessions.forEach((session) => {
        expect(session.questions.length).toEqual(1); // 1つの質問が登録されている
        expect(session.enrollments.length).toEqual(2); //「構文 誤次郎」と「仕様 曖昧子」
      });
    });
  });

  //
});
