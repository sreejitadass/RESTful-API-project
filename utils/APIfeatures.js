class APIoperations{
    constructor(query,queryString)
    {
        this.query=query;
        this.queryString=queryString;
    }

    filter()
    {
        //1) FILTERING
        const queryObject={...this.queryString};    //instead of req.query
        const toBeDeletedFields=['page','sort','limit','fields'];
        toBeDeletedFields.forEach(el=>delete queryObject[el]);
        
        //2) ADVANCED FILTERING(for relational operations)
        let queryStr = JSON.stringify(queryObject);
        queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, match => `$${match}`);
        let modifiedQueryObject = JSON.parse(queryStr);
        this.query.find(modifiedQueryObject);   //instead of Tour

        return this;
    }

    sort()
    {
        //3)SORTING ON THE BASIS OF A FIELD
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }  
        else
        {
            this.query=this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields()
    {
        //4)LIMITING FIELDS
        if(this.queryString.fields)
        {
            const fields=this.queryString.fields.split(',').join(' ');
            this.query=this.query.select(fields);
        }
        
        return this;
    }

    paginate()
    {
        //5)PAGINATION (PARTCULAR PAGE AND NUMBER OF RESULTS)
        const pg=this.queryString.page*1||1;
        const lmt=this.queryString.limit*1||100;
        const skipVal=(pg-1)*10;    //1-(1-10),2-(11-20),....(how many results to skip determined from pg number)
        this.query=this.query.skip(skipVal).limit(lmt);

        return this;
    }
}

module.exports=APIoperations;