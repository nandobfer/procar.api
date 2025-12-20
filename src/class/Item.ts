import { Prisma } from "@prisma/client"
import { prisma } from "../prisma"
import Fuse from "fuse.js"

export type PrismaItem = Prisma.ItemGetPayload<{}>
export interface ItemForm {
    id: string
    description: string
    unit_price: number
}

export class Item {
    id: string
    description: string
    unit_price: number
    quantity: number

    static async list() {
        const result = await prisma.item.findMany()
        return result.map((item) => new Item({ ...item, quantity: 1 }))
    }

    static async query(value: string) {
        // const results = await prisma.item.findMany({
        //     where: {
        //         description: {
        //             search: value,
        //         },
        //     },
        // })
        // return results.map((item) => new Item({ ...item, quantity: 1 }))

        const list = await Item.list()
        const fuse = new Fuse<Item>(list, {
            keys: ["description"],
            threshold: 0.2,
        })
        const results = fuse.search(value)
        return results.map((result) => result.item)
    }

    static async new(item: ItemForm) {
        const result = await prisma.item.create({
            data: {
                id: item.id,
                description: item.description,
                unit_price: Number(item.unit_price),
            },
        })

        return new Item({ ...result, quantity: 1 })
    }

    static async update(item: ItemForm) {
        const result = await prisma.item.update({
            where: {
                id: item.id,
            },
            data: {
                description: item.description,
                unit_price: Number(item.unit_price),
            },
        })

        return new Item({ ...result, quantity: 1 })
    }

    static async upsert(item: Item) {
        const upserted = await prisma.item.upsert({
            where: { id: item.id },
            create: {
                id: item.id,
                description: item.description,
                unit_price: Number(item.unit_price),
            },
            update: {
                description: item.description,
                unit_price: Number(item.unit_price),
            },
        })
        return new Item({ ...upserted, quantity: item.quantity })
    }

    static async delete(id: string) {
        await prisma.item.delete({
            where: { id },
        })
    }

    constructor(data: Item) {
        this.id = data.id
        this.description = data.description
        this.unit_price = data.unit_price
        this.quantity = data.quantity
    }
}
