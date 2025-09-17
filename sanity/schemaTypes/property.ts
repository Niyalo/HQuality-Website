import { defineField } from "sanity"
import agent from "./agent"

const property = {
    name: "property",
    title: "Property",
    type: "document",
    fields:[
        defineField({
            name: 'property_id',
            title: 'Property ID',
            type: 'number',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'address',
            title: 'Address',
            type: 'string',
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
            name: 'built_in',
            title: 'Built In', 
            type: 'date',
            validation: Rule => Rule.required(),
        }),
        defineField({
        name: 'property_img',
        title: 'Property Images',
        type: 'array',
        of: [{ type: 'image' }],
        validation: Rule =>
        Rule.required().min(1).error("Minimum 1 images required")
        }),

        defineField({
            name: 'agent',
            title: 'Assigned Agent',
            type: 'reference',
            to: [{ type: 'user' }], 
            options: {
                filter: 'role == "agent"',
        },
        }),

        defineField({
            name: 'clients',
            title: 'Assigned Clients',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'client' }] }],
        }),

        
    ]

}

export default property