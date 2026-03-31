const validator=require('validator')

const validate=(data)=>{            
        const MandatoryField=['firstName','emailID', 'password']
        const IsAllowed=MandatoryField.every((k)=>Object.keys(data).includes(k))

        if(!IsAllowed)
            throw new Error("Field missing ")

        if(!validator.isEmail(data.emailID))
            throw new Error("Invalid email")

        if(!validator.isStrongPassword(data.password))
            throw new Error("Weak Password")
}

module.exports=validate;
