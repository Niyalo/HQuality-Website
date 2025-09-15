import { defineField } from "sanity"

const agent = {
    name: "agent",
    title: "Agent",
    type: "document",
    fields:[
         defineField({
            name: 'agent_id',
            title: 'Agent ID',
            type: 'number',
            validation: Rule => Rule.required(),
        }),defineField({
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
            name: 'contact',
            title: 'Contact',
            type: 'number',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'email',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'number',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'square_footage',
            title: 'Square Footage',
            type: 'number',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'agent_img',
            title: 'Agent Image',
            type: 'image',
            options: { hotspot: true },
        }),
    ]

}

export default agent