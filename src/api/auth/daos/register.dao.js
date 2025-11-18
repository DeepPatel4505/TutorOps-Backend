import prisma from '@utils/prisma';

const createUser = async (client, { email, password, username, role }) => {
    console.log(`Creating user in DB with email: ${email}, username: ${username}, role: ${role}`);

    const newUser = await client.user.create({
        data: {
            email: email.toLowerCase(),
            password,
            username,
            name: username,
            role,
        },
    });
    return newUser;
};

const findUserByEmail = async (email) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email.toLowerCase(),
        },
    });
    return user;
};

export { createUser, findUserByEmail };
