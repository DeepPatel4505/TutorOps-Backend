import prisma from "@utils/prisma";

const createUser = async ({ email, password, username, role }) => {
    console.log(`Creating user in DB with email: ${email}, username: ${username}, role: ${role}`);
    
    const newUser = await prisma.$transaction(async (tx) => {
        console.log("Inside transaction");
        const createdUser = await tx.user.create({
            data: {
                email: email.toLowerCase(),
                password,
                username,
                name: username,
                role,
            },
        });


        //logging the msg 

        //sending welcome email

        //sending verification email

        
        return createdUser;
    }, { timeout: 10000 });
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

export {
    createUser,
    findUserByEmail,
};
