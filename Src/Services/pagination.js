
export const pagination=(page,limit)=>{
    if (!page || page<=0) {
        page=1;
    } 
    if (!limit || limit<=0) {
        limit='';
    } 
    const skip=(page-1)*limit;
    return {limit,skip};
}