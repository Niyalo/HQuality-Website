import { defineField, fieldNeedsEscape, validation } from "sanity"

const client = {
    name: "client",
    title: "Client",
    type: "document",
    fields:[
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
            name: 'address',
            title: 'Address',
            type: 'slug',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'user_img',
            title: 'Client Image',
            type: 'image',
            options: { hotspot: true },
        }),
    ]
}

export default client