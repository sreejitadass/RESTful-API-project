//FOR HANDLING ERRORS IN ASYNC FUNCTIONS(VERBS)

module.exports = fn=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    };
};