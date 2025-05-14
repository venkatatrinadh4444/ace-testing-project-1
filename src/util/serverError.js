
const serverError=(res,text,err)=> {
    console.log(`Error occured at ${text} `,err)
    return res.status(500).json({success:'error',message:'Error occured at server'})
}

export default serverError