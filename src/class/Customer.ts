import { Prisma } from "@prisma/client"
import { prisma } from "../prisma"
import Fuse from "fuse.js"

type CustomerPrisma = Prisma.CustomerGetPayload<{}>

export class Customer {
    id: string
    name: string
    email?: string
    cpf_cnpj?: string
    rg_ie?: string
    address?: string
    neighborhood?: string
    city?: string
    state?: string
    phone?: string
    cep?: string

    static async list() {
        const result = await prisma.customer.findMany()
        return result.map((data) => new Customer(data))
    }

    static async query(value: string) {
        const list = await Customer.list()
        const fuse = new Fuse(list, {
            keys: ["name"],
            threshold: 0.2,
        })
        const results = fuse.search(value)
        return results.map((result) => result.item)
    }

    constructor(data: CustomerPrisma) {
        this.id = data.id
        this.name = data.name
        this.cpf_cnpj = data.cpf_cnpj || undefined
        this.rg_ie = data.rg_ie || undefined
        this.address = data.address || undefined
        this.neighborhood = data.neighborhood || undefined
        this.city = data.city || undefined
        this.state = data.state || undefined
        this.phone = data.phone || undefined
        this.cep = data.cep || undefined
        this.email = data.email || undefined
    }
}
