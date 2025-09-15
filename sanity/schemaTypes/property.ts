import { defineField, defineType } from "sanity"
import agent from "./agent"

export default defineType({
    name: "property",
    title: "Property",
    type: "document",
    fields: [
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
            validation: Rule => Rule.required().min(1).error("Minimum 1 image required"),
        }),
    ]
})
