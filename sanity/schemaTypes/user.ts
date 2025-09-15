import { defineField, fieldNeedsEscape } from "sanity"

const user = {
    name: "user",
    title: "user",
    type: "document", 
    fields: [
        defineField({
            name: "role",
            title: "Role",
            type: "string",
            description: "Check if user is an admin or agent",
            options: {
            list: [
                { title: 'Administrator', value: 'admin' },
                { title: 'Agent', value: 'agent' },
            ],
            layout: 'radio',
            },
            validation: Rule => Rule.required(),
            
            //readonly: true
            //hidden: true
        }),
        defineField({
            name: 'firstname',
            title: 'First Name',
            type: 'string',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'lastname',
            title: 'Last Name',
            type: 'string',
            validation: Rule => Rule.required(),
        }),
        
        defineField({
            name:'contact',
            title:'Contact Number',
            type: 'number'
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: Rule => Rule.required().email(),
        }),
        defineField({
            name: 'user_img',
            title: 'User Image',
            type: 'array',
            of:[
                {
                    type: 'object',
                    fields: [
                        {name: 'url', type: 'url', title: 'URL'},
                        {name: 'file', type: 'file', title: 'File'},
                    ]
                }
            ],
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'created_at',
            title: 'Created At',
            type: 'datetime',
            readOnly: true,
            initialValue: (new Date()).toISOString(),
        })

    ]


}
export default user