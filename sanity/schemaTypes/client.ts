import { defineField } from "sanity"

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
            name: 'email',
            title: 'Email',
            type: 'email',
            validation: Rule => Rule.required()
        }),
        defineField({
            name: 'address',
            title: 'Address',
            type: 'string', 
	        validation: Rule => Rule.required(),
        }),
        // --- ADDED AGENT REFERENCE ---
        defineField({
            name: 'agent',
            title: 'Assigned Agent',
            type: 'reference',
            to: [{ type: 'user' }], // References a 'user' document
            options: {
                filter: 'role == "agent"', // Filters to only show agents
            },
        }),
        // --- ADDED CONTRACTS ARRAY ---
        defineField({
            name: 'contracts',
            title: 'Contracts',
            type: 'array',
            of: [{
                name: 'contract',
                title: 'Contract',
                type: 'object',
                fields: [
                    { name: 'title', type: 'string', title: 'File Title / Description', validation: Rule => Rule.required() },
                    { name: 'file', type: 'file', title: 'Contract File', validation: Rule => Rule.required() }
                ]
            }]
        }),
        defineField({
            name: 'contact',
            title: 'Contact',
            type: 'number',
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