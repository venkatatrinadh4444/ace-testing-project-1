import { PrismaClient } from "@prisma/client"

const database=new PrismaClient()

const dbConnection=async ()=> {
    try {
        await database.$connect()
        console.log('PostgreSQL connected successfully!')
    }
    catch(err) {
        console.log('Error occured at database connection ', err)
    }
}

export default dbConnection