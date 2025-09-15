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
            title: 'Property Image',
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
            validation: Rule => Rule.required().min(3).error("Minimum 3 images required"),
        }),
    ]

}

export default property