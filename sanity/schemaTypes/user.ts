import { defineField } from "sanity"

const user = {
    name: "user",
    title: "User",
    type: "document",
    fields:[
         defineField({
            name: 'agent_id',
            title: 'Agent ID',
            type: 'number',
            // Only show this field if the user's role is 'agent'
            hidden: ({ document }) => document?.role !== 'agent',
        }),
        defineField({
            name: 'first_name', 
            title: 'First Name',
            type: 'string',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'last_name', 
            title: 'Last Name',
            type: 'string',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'email',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'role',
            title: 'Role',
            type: 'string',
            options: {
                list: [
                    { title: 'Agent', value: 'agent' },
                    { title: 'Admin', value: 'admin' },
                ],
                layout: 'radio'
            },
            initialValue: 'agent',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'contact',
            title: 'Contact',
            type: 'number',
        }),
        defineField({
            name: 'user_img',
            title: 'User Image',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'created_at',
            title: 'Created At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            readOnly: true,
        }),
    ]
}

export default user;