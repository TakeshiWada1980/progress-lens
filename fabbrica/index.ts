import type { User } from "@prisma/client";
import type { Student } from "@prisma/client";
import type { Teacher } from "@prisma/client";
import type { Admin } from "@prisma/client";
import type { LearningSession } from "@prisma/client";
import type { SessionEnrollment } from "@prisma/client";
import type { Question } from "@prisma/client";
import type { Option } from "@prisma/client";
import type { Response } from "@prisma/client";
import type { Role } from "@prisma/client";
import type { Prisma, PrismaClient } from "@prisma/client";
import { createInitializer, createScreener, getScalarFieldValueGenerator, normalizeResolver, normalizeList, getSequenceCounter, createCallbackChain, destructure } from "@quramy/prisma-fabbrica/lib/internal";
import type { ModelWithFields, Resolver, } from "@quramy/prisma-fabbrica/lib/internal";
export { resetSequence, registerScalarFieldValueGenerator, resetScalarFieldValueGenerator } from "@quramy/prisma-fabbrica/lib/internal";

type BuildDataOptions<TTransients extends Record<string, unknown>> = {
    readonly seq: number;
} & TTransients;

type TraitName = string | symbol;

type CallbackDefineOptions<TCreated, TCreateInput, TTransients extends Record<string, unknown>> = {
    onAfterBuild?: (createInput: TCreateInput, transientFields: TTransients) => void | PromiseLike<void>;
    onBeforeCreate?: (createInput: TCreateInput, transientFields: TTransients) => void | PromiseLike<void>;
    onAfterCreate?: (created: TCreated, transientFields: TTransients) => void | PromiseLike<void>;
};

const initializer = createInitializer();

const { getClient } = initializer;

export const { initialize } = initializer;

const modelFieldDefinitions: ModelWithFields[] = [{
        name: "User",
        fields: [{
                name: "student",
                type: "Student",
                relationName: "StudentToUser"
            }, {
                name: "teacher",
                type: "Teacher",
                relationName: "TeacherToUser"
            }, {
                name: "admin",
                type: "Admin",
                relationName: "AdminToUser"
            }]
    }, {
        name: "Student",
        fields: [{
                name: "user",
                type: "User",
                relationName: "StudentToUser"
            }, {
                name: "enrollments",
                type: "SessionEnrollment",
                relationName: "SessionEnrollmentToStudent"
            }, {
                name: "responses",
                type: "Response",
                relationName: "ResponseToStudent"
            }]
    }, {
        name: "Teacher",
        fields: [{
                name: "user",
                type: "User",
                relationName: "TeacherToUser"
            }, {
                name: "sessions",
                type: "LearningSession",
                relationName: "LearningSessionToTeacher"
            }]
    }, {
        name: "Admin",
        fields: [{
                name: "user",
                type: "User",
                relationName: "AdminToUser"
            }]
    }, {
        name: "LearningSession",
        fields: [{
                name: "teacher",
                type: "Teacher",
                relationName: "LearningSessionToTeacher"
            }, {
                name: "enrollments",
                type: "SessionEnrollment",
                relationName: "LearningSessionToSessionEnrollment"
            }, {
                name: "questions",
                type: "Question",
                relationName: "LearningSessionToQuestion"
            }]
    }, {
        name: "SessionEnrollment",
        fields: [{
                name: "learningSession",
                type: "LearningSession",
                relationName: "LearningSessionToSessionEnrollment"
            }, {
                name: "student",
                type: "Student",
                relationName: "SessionEnrollmentToStudent"
            }]
    }, {
        name: "Question",
        fields: [{
                name: "session",
                type: "LearningSession",
                relationName: "LearningSessionToQuestion"
            }, {
                name: "options",
                type: "Option",
                relationName: "OptionToQuestion"
            }, {
                name: "responses",
                type: "Response",
                relationName: "QuestionToResponse"
            }, {
                name: "defaultOption",
                type: "Option",
                relationName: "DefaultOption"
            }]
    }, {
        name: "Option",
        fields: [{
                name: "question",
                type: "Question",
                relationName: "OptionToQuestion"
            }, {
                name: "responses",
                type: "Response",
                relationName: "OptionToResponse"
            }, {
                name: "defaultForQuestion",
                type: "Question",
                relationName: "DefaultOption"
            }]
    }, {
        name: "Response",
        fields: [{
                name: "student",
                type: "Student",
                relationName: "ResponseToStudent"
            }, {
                name: "question",
                type: "Question",
                relationName: "QuestionToResponse"
            }, {
                name: "option",
                type: "Option",
                relationName: "OptionToResponse"
            }]
    }];

type UserScalarOrEnumFields = {
    id: string;
    displayName: string;
};

type UserstudentFactory = {
    _factoryFor: "Student";
    build: () => PromiseLike<Prisma.StudentCreateNestedOneWithoutUserInput["create"]>;
};

type UserteacherFactory = {
    _factoryFor: "Teacher";
    build: () => PromiseLike<Prisma.TeacherCreateNestedOneWithoutUserInput["create"]>;
};

type UseradminFactory = {
    _factoryFor: "Admin";
    build: () => PromiseLike<Prisma.AdminCreateNestedOneWithoutUserInput["create"]>;
};

type UserFactoryDefineInput = {
    id?: string;
    role?: Role;
    displayName?: string;
    avatarImgKey?: string | null;
    isActive?: boolean;
    isGuest?: boolean;
    attributes?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
    createdAt?: Date;
    updatedAt?: Date;
    student?: UserstudentFactory | Prisma.StudentCreateNestedOneWithoutUserInput;
    teacher?: UserteacherFactory | Prisma.TeacherCreateNestedOneWithoutUserInput;
    admin?: UseradminFactory | Prisma.AdminCreateNestedOneWithoutUserInput;
};

type UserTransientFields = Record<string, unknown> & Partial<Record<keyof UserFactoryDefineInput, never>>;

type UserFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<UserFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<User, Prisma.UserCreateInput, TTransients>;

type UserFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<UserFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: UserFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<User, Prisma.UserCreateInput, TTransients>;

function isUserstudentFactory(x: UserstudentFactory | Prisma.StudentCreateNestedOneWithoutUserInput | undefined): x is UserstudentFactory {
    return (x as any)?._factoryFor === "Student";
}

function isUserteacherFactory(x: UserteacherFactory | Prisma.TeacherCreateNestedOneWithoutUserInput | undefined): x is UserteacherFactory {
    return (x as any)?._factoryFor === "Teacher";
}

function isUseradminFactory(x: UseradminFactory | Prisma.AdminCreateNestedOneWithoutUserInput | undefined): x is UseradminFactory {
    return (x as any)?._factoryFor === "Admin";
}

type UserTraitKeys<TOptions extends UserFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface UserFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "User";
    build(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Prisma.UserCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Prisma.UserCreateInput>;
    buildList(list: readonly Partial<Prisma.UserCreateInput & TTransients>[]): PromiseLike<Prisma.UserCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Prisma.UserCreateInput[]>;
    pickForConnect(inputData: User): Pick<User, "id">;
    create(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<User>;
    createList(list: readonly Partial<Prisma.UserCreateInput & TTransients>[]): PromiseLike<User[]>;
    createList(count: number, item?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<User[]>;
    createForConnect(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Pick<User, "id">>;
}

export interface UserFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends UserFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): UserFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateUserScalarsOrEnums({ seq }: {
    readonly seq: number;
}): UserScalarOrEnumFields {
    return {
        id: getScalarFieldValueGenerator().String({ modelName: "User", fieldName: "id", isId: true, isUnique: false, seq }),
        displayName: getScalarFieldValueGenerator().String({ modelName: "User", fieldName: "displayName", isId: false, isUnique: false, seq })
    };
}

function defineUserFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends UserFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): UserFactoryInterface<TTransients, UserTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly UserTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("User", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.UserCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateUserScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<UserFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<UserFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                student: isUserstudentFactory(defaultData.student) ? {
                    create: await defaultData.student.build()
                } : defaultData.student,
                teacher: isUserteacherFactory(defaultData.teacher) ? {
                    create: await defaultData.teacher.build()
                } : defaultData.teacher,
                admin: isUseradminFactory(defaultData.admin) ? {
                    create: await defaultData.admin.build()
                } : defaultData.admin
            } as Prisma.UserCreateInput;
            const data: Prisma.UserCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.UserCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: User) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.UserCreateInput & TTransients> = {}) => {
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().user.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.UserCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.UserCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "User" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: UserTraitKeys<TOptions>, ...names: readonly UserTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface UserFactoryBuilder {
    <TOptions extends UserFactoryDefineOptions>(options?: TOptions): UserFactoryInterface<{}, UserTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends UserTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends UserFactoryDefineOptions<TTransients>>(options?: TOptions) => UserFactoryInterface<TTransients, UserTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link User} model.
 *
 * @param options
 * @returns factory {@link UserFactoryInterface}
 */
export const defineUserFactory = (<TOptions extends UserFactoryDefineOptions>(options?: TOptions): UserFactoryInterface<TOptions> => {
    return defineUserFactoryInternal(options ?? {}, {});
}) as UserFactoryBuilder;

defineUserFactory.withTransientFields = defaultTransientFieldValues => options => defineUserFactoryInternal(options ?? {}, defaultTransientFieldValues);

type StudentScalarOrEnumFields = {};

type StudentuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutStudentInput["create"]>;
};

type StudentFactoryDefineInput = {
    reserve1?: string | null;
    reserve2?: string | null;
    attributes?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
    user: StudentuserFactory | Prisma.UserCreateNestedOneWithoutStudentInput;
    enrollments?: Prisma.SessionEnrollmentCreateNestedManyWithoutStudentInput;
    responses?: Prisma.ResponseCreateNestedManyWithoutStudentInput;
};

type StudentTransientFields = Record<string, unknown> & Partial<Record<keyof StudentFactoryDefineInput, never>>;

type StudentFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<StudentFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Student, Prisma.StudentCreateInput, TTransients>;

type StudentFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<StudentFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: StudentFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Student, Prisma.StudentCreateInput, TTransients>;

function isStudentuserFactory(x: StudentuserFactory | Prisma.UserCreateNestedOneWithoutStudentInput | undefined): x is StudentuserFactory {
    return (x as any)?._factoryFor === "User";
}

type StudentTraitKeys<TOptions extends StudentFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface StudentFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Student";
    build(inputData?: Partial<Prisma.StudentCreateInput & TTransients>): PromiseLike<Prisma.StudentCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.StudentCreateInput & TTransients>): PromiseLike<Prisma.StudentCreateInput>;
    buildList(list: readonly Partial<Prisma.StudentCreateInput & TTransients>[]): PromiseLike<Prisma.StudentCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.StudentCreateInput & TTransients>): PromiseLike<Prisma.StudentCreateInput[]>;
    pickForConnect(inputData: Student): Pick<Student, "userId">;
    create(inputData?: Partial<Prisma.StudentCreateInput & TTransients>): PromiseLike<Student>;
    createList(list: readonly Partial<Prisma.StudentCreateInput & TTransients>[]): PromiseLike<Student[]>;
    createList(count: number, item?: Partial<Prisma.StudentCreateInput & TTransients>): PromiseLike<Student[]>;
    createForConnect(inputData?: Partial<Prisma.StudentCreateInput & TTransients>): PromiseLike<Pick<Student, "userId">>;
}

export interface StudentFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends StudentFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): StudentFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateStudentScalarsOrEnums({ seq }: {
    readonly seq: number;
}): StudentScalarOrEnumFields {
    return {};
}

function defineStudentFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends StudentFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): StudentFactoryInterface<TTransients, StudentTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly StudentTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Student", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.StudentCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateStudentScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<StudentFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<StudentFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isStudentuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user
            } as Prisma.StudentCreateInput;
            const data: Prisma.StudentCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.StudentCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Student) => ({
            userId: inputData.userId
        });
        const create = async (inputData: Partial<Prisma.StudentCreateInput & TTransients> = {}) => {
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().student.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.StudentCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.StudentCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Student" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: StudentTraitKeys<TOptions>, ...names: readonly StudentTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface StudentFactoryBuilder {
    <TOptions extends StudentFactoryDefineOptions>(options: TOptions): StudentFactoryInterface<{}, StudentTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends StudentTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends StudentFactoryDefineOptions<TTransients>>(options: TOptions) => StudentFactoryInterface<TTransients, StudentTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Student} model.
 *
 * @param options
 * @returns factory {@link StudentFactoryInterface}
 */
export const defineStudentFactory = (<TOptions extends StudentFactoryDefineOptions>(options: TOptions): StudentFactoryInterface<TOptions> => {
    return defineStudentFactoryInternal(options, {});
}) as StudentFactoryBuilder;

defineStudentFactory.withTransientFields = defaultTransientFieldValues => options => defineStudentFactoryInternal(options, defaultTransientFieldValues);

type TeacherScalarOrEnumFields = {};

type TeacheruserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutTeacherInput["create"]>;
};

type TeacherFactoryDefineInput = {
    reserve1?: string | null;
    reserve2?: string | null;
    attributes?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
    user: TeacheruserFactory | Prisma.UserCreateNestedOneWithoutTeacherInput;
    sessions?: Prisma.LearningSessionCreateNestedManyWithoutTeacherInput;
};

type TeacherTransientFields = Record<string, unknown> & Partial<Record<keyof TeacherFactoryDefineInput, never>>;

type TeacherFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<TeacherFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Teacher, Prisma.TeacherCreateInput, TTransients>;

type TeacherFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<TeacherFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: TeacherFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Teacher, Prisma.TeacherCreateInput, TTransients>;

function isTeacheruserFactory(x: TeacheruserFactory | Prisma.UserCreateNestedOneWithoutTeacherInput | undefined): x is TeacheruserFactory {
    return (x as any)?._factoryFor === "User";
}

type TeacherTraitKeys<TOptions extends TeacherFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface TeacherFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Teacher";
    build(inputData?: Partial<Prisma.TeacherCreateInput & TTransients>): PromiseLike<Prisma.TeacherCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.TeacherCreateInput & TTransients>): PromiseLike<Prisma.TeacherCreateInput>;
    buildList(list: readonly Partial<Prisma.TeacherCreateInput & TTransients>[]): PromiseLike<Prisma.TeacherCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.TeacherCreateInput & TTransients>): PromiseLike<Prisma.TeacherCreateInput[]>;
    pickForConnect(inputData: Teacher): Pick<Teacher, "userId">;
    create(inputData?: Partial<Prisma.TeacherCreateInput & TTransients>): PromiseLike<Teacher>;
    createList(list: readonly Partial<Prisma.TeacherCreateInput & TTransients>[]): PromiseLike<Teacher[]>;
    createList(count: number, item?: Partial<Prisma.TeacherCreateInput & TTransients>): PromiseLike<Teacher[]>;
    createForConnect(inputData?: Partial<Prisma.TeacherCreateInput & TTransients>): PromiseLike<Pick<Teacher, "userId">>;
}

export interface TeacherFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends TeacherFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): TeacherFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateTeacherScalarsOrEnums({ seq }: {
    readonly seq: number;
}): TeacherScalarOrEnumFields {
    return {};
}

function defineTeacherFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends TeacherFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): TeacherFactoryInterface<TTransients, TeacherTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly TeacherTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Teacher", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.TeacherCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateTeacherScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<TeacherFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<TeacherFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isTeacheruserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user
            } as Prisma.TeacherCreateInput;
            const data: Prisma.TeacherCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.TeacherCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Teacher) => ({
            userId: inputData.userId
        });
        const create = async (inputData: Partial<Prisma.TeacherCreateInput & TTransients> = {}) => {
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().teacher.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.TeacherCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.TeacherCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Teacher" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: TeacherTraitKeys<TOptions>, ...names: readonly TeacherTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface TeacherFactoryBuilder {
    <TOptions extends TeacherFactoryDefineOptions>(options: TOptions): TeacherFactoryInterface<{}, TeacherTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends TeacherTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends TeacherFactoryDefineOptions<TTransients>>(options: TOptions) => TeacherFactoryInterface<TTransients, TeacherTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Teacher} model.
 *
 * @param options
 * @returns factory {@link TeacherFactoryInterface}
 */
export const defineTeacherFactory = (<TOptions extends TeacherFactoryDefineOptions>(options: TOptions): TeacherFactoryInterface<TOptions> => {
    return defineTeacherFactoryInternal(options, {});
}) as TeacherFactoryBuilder;

defineTeacherFactory.withTransientFields = defaultTransientFieldValues => options => defineTeacherFactoryInternal(options, defaultTransientFieldValues);

type AdminScalarOrEnumFields = {};

type AdminuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutAdminInput["create"]>;
};

type AdminFactoryDefineInput = {
    reserve1?: string | null;
    reserve2?: string | null;
    attributes?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
    user: AdminuserFactory | Prisma.UserCreateNestedOneWithoutAdminInput;
};

type AdminTransientFields = Record<string, unknown> & Partial<Record<keyof AdminFactoryDefineInput, never>>;

type AdminFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<AdminFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Admin, Prisma.AdminCreateInput, TTransients>;

type AdminFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<AdminFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: AdminFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Admin, Prisma.AdminCreateInput, TTransients>;

function isAdminuserFactory(x: AdminuserFactory | Prisma.UserCreateNestedOneWithoutAdminInput | undefined): x is AdminuserFactory {
    return (x as any)?._factoryFor === "User";
}

type AdminTraitKeys<TOptions extends AdminFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface AdminFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Admin";
    build(inputData?: Partial<Prisma.AdminCreateInput & TTransients>): PromiseLike<Prisma.AdminCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.AdminCreateInput & TTransients>): PromiseLike<Prisma.AdminCreateInput>;
    buildList(list: readonly Partial<Prisma.AdminCreateInput & TTransients>[]): PromiseLike<Prisma.AdminCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.AdminCreateInput & TTransients>): PromiseLike<Prisma.AdminCreateInput[]>;
    pickForConnect(inputData: Admin): Pick<Admin, "userId">;
    create(inputData?: Partial<Prisma.AdminCreateInput & TTransients>): PromiseLike<Admin>;
    createList(list: readonly Partial<Prisma.AdminCreateInput & TTransients>[]): PromiseLike<Admin[]>;
    createList(count: number, item?: Partial<Prisma.AdminCreateInput & TTransients>): PromiseLike<Admin[]>;
    createForConnect(inputData?: Partial<Prisma.AdminCreateInput & TTransients>): PromiseLike<Pick<Admin, "userId">>;
}

export interface AdminFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends AdminFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): AdminFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateAdminScalarsOrEnums({ seq }: {
    readonly seq: number;
}): AdminScalarOrEnumFields {
    return {};
}

function defineAdminFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends AdminFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): AdminFactoryInterface<TTransients, AdminTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly AdminTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Admin", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.AdminCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateAdminScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<AdminFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<AdminFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isAdminuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user
            } as Prisma.AdminCreateInput;
            const data: Prisma.AdminCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.AdminCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Admin) => ({
            userId: inputData.userId
        });
        const create = async (inputData: Partial<Prisma.AdminCreateInput & TTransients> = {}) => {
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().admin.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.AdminCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.AdminCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Admin" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: AdminTraitKeys<TOptions>, ...names: readonly AdminTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface AdminFactoryBuilder {
    <TOptions extends AdminFactoryDefineOptions>(options: TOptions): AdminFactoryInterface<{}, AdminTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends AdminTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends AdminFactoryDefineOptions<TTransients>>(options: TOptions) => AdminFactoryInterface<TTransients, AdminTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Admin} model.
 *
 * @param options
 * @returns factory {@link AdminFactoryInterface}
 */
export const defineAdminFactory = (<TOptions extends AdminFactoryDefineOptions>(options: TOptions): AdminFactoryInterface<TOptions> => {
    return defineAdminFactoryInternal(options, {});
}) as AdminFactoryBuilder;

defineAdminFactory.withTransientFields = defaultTransientFieldValues => options => defineAdminFactoryInternal(options, defaultTransientFieldValues);

type LearningSessionScalarOrEnumFields = {
    title: string;
    accessCode: string;
};

type LearningSessionteacherFactory = {
    _factoryFor: "Teacher";
    build: () => PromiseLike<Prisma.TeacherCreateNestedOneWithoutSessionsInput["create"]>;
};

type LearningSessionFactoryDefineInput = {
    id?: string;
    title?: string;
    accessCode?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    teacher: LearningSessionteacherFactory | Prisma.TeacherCreateNestedOneWithoutSessionsInput;
    enrollments?: Prisma.SessionEnrollmentCreateNestedManyWithoutLearningSessionInput;
    questions?: Prisma.QuestionCreateNestedManyWithoutSessionInput;
};

type LearningSessionTransientFields = Record<string, unknown> & Partial<Record<keyof LearningSessionFactoryDefineInput, never>>;

type LearningSessionFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<LearningSessionFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<LearningSession, Prisma.LearningSessionCreateInput, TTransients>;

type LearningSessionFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<LearningSessionFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: LearningSessionFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<LearningSession, Prisma.LearningSessionCreateInput, TTransients>;

function isLearningSessionteacherFactory(x: LearningSessionteacherFactory | Prisma.TeacherCreateNestedOneWithoutSessionsInput | undefined): x is LearningSessionteacherFactory {
    return (x as any)?._factoryFor === "Teacher";
}

type LearningSessionTraitKeys<TOptions extends LearningSessionFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface LearningSessionFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "LearningSession";
    build(inputData?: Partial<Prisma.LearningSessionCreateInput & TTransients>): PromiseLike<Prisma.LearningSessionCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.LearningSessionCreateInput & TTransients>): PromiseLike<Prisma.LearningSessionCreateInput>;
    buildList(list: readonly Partial<Prisma.LearningSessionCreateInput & TTransients>[]): PromiseLike<Prisma.LearningSessionCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.LearningSessionCreateInput & TTransients>): PromiseLike<Prisma.LearningSessionCreateInput[]>;
    pickForConnect(inputData: LearningSession): Pick<LearningSession, "id">;
    create(inputData?: Partial<Prisma.LearningSessionCreateInput & TTransients>): PromiseLike<LearningSession>;
    createList(list: readonly Partial<Prisma.LearningSessionCreateInput & TTransients>[]): PromiseLike<LearningSession[]>;
    createList(count: number, item?: Partial<Prisma.LearningSessionCreateInput & TTransients>): PromiseLike<LearningSession[]>;
    createForConnect(inputData?: Partial<Prisma.LearningSessionCreateInput & TTransients>): PromiseLike<Pick<LearningSession, "id">>;
}

export interface LearningSessionFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends LearningSessionFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): LearningSessionFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateLearningSessionScalarsOrEnums({ seq }: {
    readonly seq: number;
}): LearningSessionScalarOrEnumFields {
    return {
        title: getScalarFieldValueGenerator().String({ modelName: "LearningSession", fieldName: "title", isId: false, isUnique: false, seq }),
        accessCode: getScalarFieldValueGenerator().String({ modelName: "LearningSession", fieldName: "accessCode", isId: false, isUnique: true, seq })
    };
}

function defineLearningSessionFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends LearningSessionFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): LearningSessionFactoryInterface<TTransients, LearningSessionTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly LearningSessionTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("LearningSession", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.LearningSessionCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateLearningSessionScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<LearningSessionFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<LearningSessionFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                teacher: isLearningSessionteacherFactory(defaultData.teacher) ? {
                    create: await defaultData.teacher.build()
                } : defaultData.teacher
            } as Prisma.LearningSessionCreateInput;
            const data: Prisma.LearningSessionCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.LearningSessionCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: LearningSession) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.LearningSessionCreateInput & TTransients> = {}) => {
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().learningSession.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.LearningSessionCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.LearningSessionCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "LearningSession" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: LearningSessionTraitKeys<TOptions>, ...names: readonly LearningSessionTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface LearningSessionFactoryBuilder {
    <TOptions extends LearningSessionFactoryDefineOptions>(options: TOptions): LearningSessionFactoryInterface<{}, LearningSessionTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends LearningSessionTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends LearningSessionFactoryDefineOptions<TTransients>>(options: TOptions) => LearningSessionFactoryInterface<TTransients, LearningSessionTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link LearningSession} model.
 *
 * @param options
 * @returns factory {@link LearningSessionFactoryInterface}
 */
export const defineLearningSessionFactory = (<TOptions extends LearningSessionFactoryDefineOptions>(options: TOptions): LearningSessionFactoryInterface<TOptions> => {
    return defineLearningSessionFactoryInternal(options, {});
}) as LearningSessionFactoryBuilder;

defineLearningSessionFactory.withTransientFields = defaultTransientFieldValues => options => defineLearningSessionFactoryInternal(options, defaultTransientFieldValues);

type SessionEnrollmentScalarOrEnumFields = {};

type SessionEnrollmentlearningSessionFactory = {
    _factoryFor: "LearningSession";
    build: () => PromiseLike<Prisma.LearningSessionCreateNestedOneWithoutEnrollmentsInput["create"]>;
};

type SessionEnrollmentstudentFactory = {
    _factoryFor: "Student";
    build: () => PromiseLike<Prisma.StudentCreateNestedOneWithoutEnrollmentsInput["create"]>;
};

type SessionEnrollmentFactoryDefineInput = {
    deletedAt?: Date | null;
    enrolledAt?: Date;
    learningSession: SessionEnrollmentlearningSessionFactory | Prisma.LearningSessionCreateNestedOneWithoutEnrollmentsInput;
    student: SessionEnrollmentstudentFactory | Prisma.StudentCreateNestedOneWithoutEnrollmentsInput;
};

type SessionEnrollmentTransientFields = Record<string, unknown> & Partial<Record<keyof SessionEnrollmentFactoryDefineInput, never>>;

type SessionEnrollmentFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<SessionEnrollmentFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<SessionEnrollment, Prisma.SessionEnrollmentCreateInput, TTransients>;

type SessionEnrollmentFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<SessionEnrollmentFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: SessionEnrollmentFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<SessionEnrollment, Prisma.SessionEnrollmentCreateInput, TTransients>;

function isSessionEnrollmentlearningSessionFactory(x: SessionEnrollmentlearningSessionFactory | Prisma.LearningSessionCreateNestedOneWithoutEnrollmentsInput | undefined): x is SessionEnrollmentlearningSessionFactory {
    return (x as any)?._factoryFor === "LearningSession";
}

function isSessionEnrollmentstudentFactory(x: SessionEnrollmentstudentFactory | Prisma.StudentCreateNestedOneWithoutEnrollmentsInput | undefined): x is SessionEnrollmentstudentFactory {
    return (x as any)?._factoryFor === "Student";
}

type SessionEnrollmentTraitKeys<TOptions extends SessionEnrollmentFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface SessionEnrollmentFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "SessionEnrollment";
    build(inputData?: Partial<Prisma.SessionEnrollmentCreateInput & TTransients>): PromiseLike<Prisma.SessionEnrollmentCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.SessionEnrollmentCreateInput & TTransients>): PromiseLike<Prisma.SessionEnrollmentCreateInput>;
    buildList(list: readonly Partial<Prisma.SessionEnrollmentCreateInput & TTransients>[]): PromiseLike<Prisma.SessionEnrollmentCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.SessionEnrollmentCreateInput & TTransients>): PromiseLike<Prisma.SessionEnrollmentCreateInput[]>;
    pickForConnect(inputData: SessionEnrollment): Pick<SessionEnrollment, "sessionId" | "studentId">;
    create(inputData?: Partial<Prisma.SessionEnrollmentCreateInput & TTransients>): PromiseLike<SessionEnrollment>;
    createList(list: readonly Partial<Prisma.SessionEnrollmentCreateInput & TTransients>[]): PromiseLike<SessionEnrollment[]>;
    createList(count: number, item?: Partial<Prisma.SessionEnrollmentCreateInput & TTransients>): PromiseLike<SessionEnrollment[]>;
    createForConnect(inputData?: Partial<Prisma.SessionEnrollmentCreateInput & TTransients>): PromiseLike<Pick<SessionEnrollment, "sessionId" | "studentId">>;
}

export interface SessionEnrollmentFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends SessionEnrollmentFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): SessionEnrollmentFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateSessionEnrollmentScalarsOrEnums({ seq }: {
    readonly seq: number;
}): SessionEnrollmentScalarOrEnumFields {
    return {};
}

function defineSessionEnrollmentFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends SessionEnrollmentFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): SessionEnrollmentFactoryInterface<TTransients, SessionEnrollmentTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly SessionEnrollmentTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("SessionEnrollment", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.SessionEnrollmentCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateSessionEnrollmentScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<SessionEnrollmentFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<SessionEnrollmentFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                learningSession: isSessionEnrollmentlearningSessionFactory(defaultData.learningSession) ? {
                    create: await defaultData.learningSession.build()
                } : defaultData.learningSession,
                student: isSessionEnrollmentstudentFactory(defaultData.student) ? {
                    create: await defaultData.student.build()
                } : defaultData.student
            } as Prisma.SessionEnrollmentCreateInput;
            const data: Prisma.SessionEnrollmentCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.SessionEnrollmentCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: SessionEnrollment) => ({
            sessionId: inputData.sessionId,
            studentId: inputData.studentId
        });
        const create = async (inputData: Partial<Prisma.SessionEnrollmentCreateInput & TTransients> = {}) => {
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().sessionEnrollment.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.SessionEnrollmentCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.SessionEnrollmentCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "SessionEnrollment" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: SessionEnrollmentTraitKeys<TOptions>, ...names: readonly SessionEnrollmentTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface SessionEnrollmentFactoryBuilder {
    <TOptions extends SessionEnrollmentFactoryDefineOptions>(options: TOptions): SessionEnrollmentFactoryInterface<{}, SessionEnrollmentTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends SessionEnrollmentTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends SessionEnrollmentFactoryDefineOptions<TTransients>>(options: TOptions) => SessionEnrollmentFactoryInterface<TTransients, SessionEnrollmentTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link SessionEnrollment} model.
 *
 * @param options
 * @returns factory {@link SessionEnrollmentFactoryInterface}
 */
export const defineSessionEnrollmentFactory = (<TOptions extends SessionEnrollmentFactoryDefineOptions>(options: TOptions): SessionEnrollmentFactoryInterface<TOptions> => {
    return defineSessionEnrollmentFactoryInternal(options, {});
}) as SessionEnrollmentFactoryBuilder;

defineSessionEnrollmentFactory.withTransientFields = defaultTransientFieldValues => options => defineSessionEnrollmentFactoryInternal(options, defaultTransientFieldValues);

type QuestionScalarOrEnumFields = {
    order: number;
    title: string;
};

type QuestionsessionFactory = {
    _factoryFor: "LearningSession";
    build: () => PromiseLike<Prisma.LearningSessionCreateNestedOneWithoutQuestionsInput["create"]>;
};

type QuestiondefaultOptionFactory = {
    _factoryFor: "Option";
    build: () => PromiseLike<Prisma.OptionCreateNestedOneWithoutDefaultForQuestionInput["create"]>;
};

type QuestionFactoryDefineInput = {
    id?: string;
    order?: number;
    title?: string;
    description?: string;
    updatedAt?: Date;
    session: QuestionsessionFactory | Prisma.LearningSessionCreateNestedOneWithoutQuestionsInput;
    options?: Prisma.OptionCreateNestedManyWithoutQuestionInput;
    responses?: Prisma.ResponseCreateNestedManyWithoutQuestionInput;
    defaultOption?: QuestiondefaultOptionFactory | Prisma.OptionCreateNestedOneWithoutDefaultForQuestionInput;
};

type QuestionTransientFields = Record<string, unknown> & Partial<Record<keyof QuestionFactoryDefineInput, never>>;

type QuestionFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<QuestionFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Question, Prisma.QuestionCreateInput, TTransients>;

type QuestionFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<QuestionFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: QuestionFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Question, Prisma.QuestionCreateInput, TTransients>;

function isQuestionsessionFactory(x: QuestionsessionFactory | Prisma.LearningSessionCreateNestedOneWithoutQuestionsInput | undefined): x is QuestionsessionFactory {
    return (x as any)?._factoryFor === "LearningSession";
}

function isQuestiondefaultOptionFactory(x: QuestiondefaultOptionFactory | Prisma.OptionCreateNestedOneWithoutDefaultForQuestionInput | undefined): x is QuestiondefaultOptionFactory {
    return (x as any)?._factoryFor === "Option";
}

type QuestionTraitKeys<TOptions extends QuestionFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface QuestionFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Question";
    build(inputData?: Partial<Prisma.QuestionCreateInput & TTransients>): PromiseLike<Prisma.QuestionCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.QuestionCreateInput & TTransients>): PromiseLike<Prisma.QuestionCreateInput>;
    buildList(list: readonly Partial<Prisma.QuestionCreateInput & TTransients>[]): PromiseLike<Prisma.QuestionCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.QuestionCreateInput & TTransients>): PromiseLike<Prisma.QuestionCreateInput[]>;
    pickForConnect(inputData: Question): Pick<Question, "id">;
    create(inputData?: Partial<Prisma.QuestionCreateInput & TTransients>): PromiseLike<Question>;
    createList(list: readonly Partial<Prisma.QuestionCreateInput & TTransients>[]): PromiseLike<Question[]>;
    createList(count: number, item?: Partial<Prisma.QuestionCreateInput & TTransients>): PromiseLike<Question[]>;
    createForConnect(inputData?: Partial<Prisma.QuestionCreateInput & TTransients>): PromiseLike<Pick<Question, "id">>;
}

export interface QuestionFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends QuestionFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): QuestionFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateQuestionScalarsOrEnums({ seq }: {
    readonly seq: number;
}): QuestionScalarOrEnumFields {
    return {
        order: getScalarFieldValueGenerator().Int({ modelName: "Question", fieldName: "order", isId: false, isUnique: false, seq }),
        title: getScalarFieldValueGenerator().String({ modelName: "Question", fieldName: "title", isId: false, isUnique: false, seq })
    };
}

function defineQuestionFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends QuestionFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): QuestionFactoryInterface<TTransients, QuestionTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly QuestionTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Question", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.QuestionCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateQuestionScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<QuestionFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<QuestionFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                session: isQuestionsessionFactory(defaultData.session) ? {
                    create: await defaultData.session.build()
                } : defaultData.session,
                defaultOption: isQuestiondefaultOptionFactory(defaultData.defaultOption) ? {
                    create: await defaultData.defaultOption.build()
                } : defaultData.defaultOption
            } as Prisma.QuestionCreateInput;
            const data: Prisma.QuestionCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.QuestionCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Question) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.QuestionCreateInput & TTransients> = {}) => {
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().question.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.QuestionCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.QuestionCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Question" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: QuestionTraitKeys<TOptions>, ...names: readonly QuestionTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface QuestionFactoryBuilder {
    <TOptions extends QuestionFactoryDefineOptions>(options: TOptions): QuestionFactoryInterface<{}, QuestionTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends QuestionTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends QuestionFactoryDefineOptions<TTransients>>(options: TOptions) => QuestionFactoryInterface<TTransients, QuestionTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Question} model.
 *
 * @param options
 * @returns factory {@link QuestionFactoryInterface}
 */
export const defineQuestionFactory = (<TOptions extends QuestionFactoryDefineOptions>(options: TOptions): QuestionFactoryInterface<TOptions> => {
    return defineQuestionFactoryInternal(options, {});
}) as QuestionFactoryBuilder;

defineQuestionFactory.withTransientFields = defaultTransientFieldValues => options => defineQuestionFactoryInternal(options, defaultTransientFieldValues);

type OptionScalarOrEnumFields = {
    order: number;
    title: string;
};

type OptionquestionFactory = {
    _factoryFor: "Question";
    build: () => PromiseLike<Prisma.QuestionCreateNestedOneWithoutOptionsInput["create"]>;
};

type OptiondefaultForQuestionFactory = {
    _factoryFor: "Question";
    build: () => PromiseLike<Prisma.QuestionCreateNestedOneWithoutDefaultOptionInput["create"]>;
};

type OptionFactoryDefineInput = {
    id?: string;
    order?: number;
    title?: string;
    description?: string;
    rewardMessage?: string;
    rewardPoint?: number;
    effect?: boolean;
    updatedAt?: Date;
    question: OptionquestionFactory | Prisma.QuestionCreateNestedOneWithoutOptionsInput;
    responses?: Prisma.ResponseCreateNestedManyWithoutOptionInput;
    defaultForQuestion?: OptiondefaultForQuestionFactory | Prisma.QuestionCreateNestedOneWithoutDefaultOptionInput;
};

type OptionTransientFields = Record<string, unknown> & Partial<Record<keyof OptionFactoryDefineInput, never>>;

type OptionFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<OptionFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Option, Prisma.OptionCreateInput, TTransients>;

type OptionFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<OptionFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: OptionFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Option, Prisma.OptionCreateInput, TTransients>;

function isOptionquestionFactory(x: OptionquestionFactory | Prisma.QuestionCreateNestedOneWithoutOptionsInput | undefined): x is OptionquestionFactory {
    return (x as any)?._factoryFor === "Question";
}

function isOptiondefaultForQuestionFactory(x: OptiondefaultForQuestionFactory | Prisma.QuestionCreateNestedOneWithoutDefaultOptionInput | undefined): x is OptiondefaultForQuestionFactory {
    return (x as any)?._factoryFor === "Question";
}

type OptionTraitKeys<TOptions extends OptionFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface OptionFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Option";
    build(inputData?: Partial<Prisma.OptionCreateInput & TTransients>): PromiseLike<Prisma.OptionCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.OptionCreateInput & TTransients>): PromiseLike<Prisma.OptionCreateInput>;
    buildList(list: readonly Partial<Prisma.OptionCreateInput & TTransients>[]): PromiseLike<Prisma.OptionCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.OptionCreateInput & TTransients>): PromiseLike<Prisma.OptionCreateInput[]>;
    pickForConnect(inputData: Option): Pick<Option, "id">;
    create(inputData?: Partial<Prisma.OptionCreateInput & TTransients>): PromiseLike<Option>;
    createList(list: readonly Partial<Prisma.OptionCreateInput & TTransients>[]): PromiseLike<Option[]>;
    createList(count: number, item?: Partial<Prisma.OptionCreateInput & TTransients>): PromiseLike<Option[]>;
    createForConnect(inputData?: Partial<Prisma.OptionCreateInput & TTransients>): PromiseLike<Pick<Option, "id">>;
}

export interface OptionFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends OptionFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): OptionFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateOptionScalarsOrEnums({ seq }: {
    readonly seq: number;
}): OptionScalarOrEnumFields {
    return {
        order: getScalarFieldValueGenerator().Int({ modelName: "Option", fieldName: "order", isId: false, isUnique: false, seq }),
        title: getScalarFieldValueGenerator().String({ modelName: "Option", fieldName: "title", isId: false, isUnique: false, seq })
    };
}

function defineOptionFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends OptionFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): OptionFactoryInterface<TTransients, OptionTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly OptionTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Option", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.OptionCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateOptionScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<OptionFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<OptionFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                question: isOptionquestionFactory(defaultData.question) ? {
                    create: await defaultData.question.build()
                } : defaultData.question,
                defaultForQuestion: isOptiondefaultForQuestionFactory(defaultData.defaultForQuestion) ? {
                    create: await defaultData.defaultForQuestion.build()
                } : defaultData.defaultForQuestion
            } as Prisma.OptionCreateInput;
            const data: Prisma.OptionCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.OptionCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Option) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.OptionCreateInput & TTransients> = {}) => {
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().option.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.OptionCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.OptionCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Option" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: OptionTraitKeys<TOptions>, ...names: readonly OptionTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface OptionFactoryBuilder {
    <TOptions extends OptionFactoryDefineOptions>(options: TOptions): OptionFactoryInterface<{}, OptionTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends OptionTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends OptionFactoryDefineOptions<TTransients>>(options: TOptions) => OptionFactoryInterface<TTransients, OptionTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Option} model.
 *
 * @param options
 * @returns factory {@link OptionFactoryInterface}
 */
export const defineOptionFactory = (<TOptions extends OptionFactoryDefineOptions>(options: TOptions): OptionFactoryInterface<TOptions> => {
    return defineOptionFactoryInternal(options, {});
}) as OptionFactoryBuilder;

defineOptionFactory.withTransientFields = defaultTransientFieldValues => options => defineOptionFactoryInternal(options, defaultTransientFieldValues);

type ResponseScalarOrEnumFields = {};

type ResponsestudentFactory = {
    _factoryFor: "Student";
    build: () => PromiseLike<Prisma.StudentCreateNestedOneWithoutResponsesInput["create"]>;
};

type ResponsequestionFactory = {
    _factoryFor: "Question";
    build: () => PromiseLike<Prisma.QuestionCreateNestedOneWithoutResponsesInput["create"]>;
};

type ResponseoptionFactory = {
    _factoryFor: "Option";
    build: () => PromiseLike<Prisma.OptionCreateNestedOneWithoutResponsesInput["create"]>;
};

type ResponseFactoryDefineInput = {
    updatedAt?: Date;
    student: ResponsestudentFactory | Prisma.StudentCreateNestedOneWithoutResponsesInput;
    question: ResponsequestionFactory | Prisma.QuestionCreateNestedOneWithoutResponsesInput;
    option: ResponseoptionFactory | Prisma.OptionCreateNestedOneWithoutResponsesInput;
};

type ResponseTransientFields = Record<string, unknown> & Partial<Record<keyof ResponseFactoryDefineInput, never>>;

type ResponseFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ResponseFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Response, Prisma.ResponseCreateInput, TTransients>;

type ResponseFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<ResponseFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: ResponseFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Response, Prisma.ResponseCreateInput, TTransients>;

function isResponsestudentFactory(x: ResponsestudentFactory | Prisma.StudentCreateNestedOneWithoutResponsesInput | undefined): x is ResponsestudentFactory {
    return (x as any)?._factoryFor === "Student";
}

function isResponsequestionFactory(x: ResponsequestionFactory | Prisma.QuestionCreateNestedOneWithoutResponsesInput | undefined): x is ResponsequestionFactory {
    return (x as any)?._factoryFor === "Question";
}

function isResponseoptionFactory(x: ResponseoptionFactory | Prisma.OptionCreateNestedOneWithoutResponsesInput | undefined): x is ResponseoptionFactory {
    return (x as any)?._factoryFor === "Option";
}

type ResponseTraitKeys<TOptions extends ResponseFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface ResponseFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Response";
    build(inputData?: Partial<Prisma.ResponseCreateInput & TTransients>): PromiseLike<Prisma.ResponseCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ResponseCreateInput & TTransients>): PromiseLike<Prisma.ResponseCreateInput>;
    buildList(list: readonly Partial<Prisma.ResponseCreateInput & TTransients>[]): PromiseLike<Prisma.ResponseCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ResponseCreateInput & TTransients>): PromiseLike<Prisma.ResponseCreateInput[]>;
    pickForConnect(inputData: Response): Pick<Response, "id">;
    create(inputData?: Partial<Prisma.ResponseCreateInput & TTransients>): PromiseLike<Response>;
    createList(list: readonly Partial<Prisma.ResponseCreateInput & TTransients>[]): PromiseLike<Response[]>;
    createList(count: number, item?: Partial<Prisma.ResponseCreateInput & TTransients>): PromiseLike<Response[]>;
    createForConnect(inputData?: Partial<Prisma.ResponseCreateInput & TTransients>): PromiseLike<Pick<Response, "id">>;
}

export interface ResponseFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ResponseFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ResponseFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateResponseScalarsOrEnums({ seq }: {
    readonly seq: number;
}): ResponseScalarOrEnumFields {
    return {};
}

function defineResponseFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends ResponseFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): ResponseFactoryInterface<TTransients, ResponseTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly ResponseTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Response", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.ResponseCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateResponseScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<ResponseFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<ResponseFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                student: isResponsestudentFactory(defaultData.student) ? {
                    create: await defaultData.student.build()
                } : defaultData.student,
                question: isResponsequestionFactory(defaultData.question) ? {
                    create: await defaultData.question.build()
                } : defaultData.question,
                option: isResponseoptionFactory(defaultData.option) ? {
                    create: await defaultData.option.build()
                } : defaultData.option
            } as Prisma.ResponseCreateInput;
            const data: Prisma.ResponseCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ResponseCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Response) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.ResponseCreateInput & TTransients> = {}) => {
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().response.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ResponseCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.ResponseCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Response" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: ResponseTraitKeys<TOptions>, ...names: readonly ResponseTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface ResponseFactoryBuilder {
    <TOptions extends ResponseFactoryDefineOptions>(options: TOptions): ResponseFactoryInterface<{}, ResponseTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ResponseTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ResponseFactoryDefineOptions<TTransients>>(options: TOptions) => ResponseFactoryInterface<TTransients, ResponseTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Response} model.
 *
 * @param options
 * @returns factory {@link ResponseFactoryInterface}
 */
export const defineResponseFactory = (<TOptions extends ResponseFactoryDefineOptions>(options: TOptions): ResponseFactoryInterface<TOptions> => {
    return defineResponseFactoryInternal(options, {});
}) as ResponseFactoryBuilder;

defineResponseFactory.withTransientFields = defaultTransientFieldValues => options => defineResponseFactoryInternal(options, defaultTransientFieldValues);
