import { Prisma } from "@prisma/client"
import { Customer } from "./Customer"
import { Item } from "./Item"
import { prisma } from "../prisma"
import { FileUpload, WithoutFunctions } from "./helpers"
import Fuse from "fuse.js"
import { saveFile } from "../tools/saveFile"
import { UploadedFile } from "express-fileupload"
import { PdfField, PdfHandler } from "./PdfHandler"
import { currencyMask } from "../tools/currencyMask"

export const order_include = Prisma.validator<Prisma.OrderInclude>()({
    customer: true,
})
type OrderPrisma = Prisma.OrderGetPayload<{ include: typeof order_include }>

export interface Attachment {
    id: string
    filename: string
    url: string
    width: number
    height: number
}

export type OrderForm = Omit<WithoutFunctions<Order>, "id" | "attachments"> & { attachments?: Attachment[] }

export class Order {
    id: string
    number: string
    order_date: number
    validity?: number
    discount: number
    additional_charges: number
    notes?: string
    payment_terms?: string

    // json fields
    attachments: Attachment[]
    items: Item[]

    customerId?: string
    customer: Customer

    static async list() {
        const result = await prisma.order.findMany({ include: order_include })
        return result.map((order) => new Order(order))
    }

    static async get(id: string) {
        const result = await prisma.order.findUnique({ where: { id }, include: order_include })
        if (result) return new Order(result)
        return null
    }

    static async getNextAvailableNumber() {
        const lastOrder = await prisma.order.findFirst({
            orderBy: { number: "desc" },
        })
        if (lastOrder) {
            const lastNumber = Number(lastOrder.number)
            return lastNumber + 1
        }
        return 1
    }

    static async validateNumber(number: string) {
        const order = await prisma.order.findUnique({ where: { number } })
        return order ? false : true
    }

    static async query(value: string) {
        const list = await Order.list()
        const customerResult = await Customer.query(value)

        const keys: (keyof Order)[] = ["number"]
        const fuse = new Fuse(list, {
            keys,
            threshold: 0.2,
        })
        const results = fuse.search(value).map((result) => result.item)

        for (const customer of customerResult) {
            const customerOrders = list.filter((order) => order.customerId === customer.id)
            for (const order of customerOrders) {
                if (!results.find((r) => r.id === order.id)) {
                    results.push(order)
                }
            }
        }

        return results
    }

    static async create(data: OrderForm) {
        const created = await prisma.order.create({
            data: {
                customer: {
                    connectOrCreate: {
                        where: { id: data.customer.id || "create" },
                        create: {
                            name: data.customer.name,
                            city: data.customer.city,
                            cpf_cnpj: data.customer.cpf_cnpj,
                            rg_ie: data.customer.rg_ie,
                            address: data.customer.address,
                            neighborhood: data.customer.neighborhood,
                            state: data.customer.state,
                            phone: data.customer.phone,
                            cep: data.customer.cep,
                            email: data.customer.email,
                        },
                    },
                },
                items: JSON.stringify(data.items),
                number: data.number,
                order_date: data.order_date.toString(),
                notes: data.notes,
                attachments: JSON.stringify([]),
                payment_terms: data.payment_terms,
                additional_charges: data.additional_charges,
                discount: data.discount,
                validity: data.validity ? data.validity.toString() : undefined,
            },
            include: order_include,
        })
        return new Order(created)
    }

    constructor(data: OrderPrisma) {
        this.id = data.id
        this.number = data.number
        this.order_date = Number(data.order_date)
        this.notes = data.notes || undefined
        this.additional_charges = data.additional_charges
        this.discount = data.discount
        this.attachments = data.attachments ? JSON.parse(data.attachments as string) : []
        this.payment_terms = data.payment_terms || undefined

        this.customerId = data.customerId
        this.customer = new Customer(data.customer)
        this.items = JSON.parse(data.items as string)
    }

    async update(data: Partial<OrderForm>) {
        const result = await prisma.order.update({
            where: { id: this.id },
            data: {
                notes: data.notes,
                payment_terms: data.payment_terms,
                items: data.items ? JSON.stringify(data.items) : undefined,
                attachments: data.attachments ? JSON.stringify(data.attachments) : undefined,
                additional_charges: data.additional_charges,
                discount: data.discount,
                validity: data.validity ? data.validity.toString() : undefined,
                number: data.number,
                customer: {
                    update: {
                        city: data.customer?.city,
                        cpf_cnpj: data.customer?.cpf_cnpj,
                        rg_ie: data.customer?.rg_ie,
                        address: data.customer?.address,
                        neighborhood: data.customer?.neighborhood,
                        state: data.customer?.state,
                        phone: data.customer?.phone,
                        name: data.customer?.name,
                        cep: data.customer?.cep,
                        email: data.customer?.email,
                    },
                },
            },
            include: order_include,
        })

        Object.assign(this, new Order(result))
        return this
    }

    async delete() {
        await prisma.order.delete({ where: { id: this.id } })
    }

    async uploadAttachments(attachments: UploadedFile[], data: Attachment[]) {
        for (const [index, attachment] of attachments.entries()) {
            const attachmentData = data[index]
            attachmentData.url = saveFile(`orders/${this.id}`, attachment.data, attachment.name).url
            this.attachments.push(attachmentData)
        }
        await this.update({ attachments: this.attachments })
        return this
    }

    async deleteAttachment(attachment_id: string) {
        const updatedAttachments = this.attachments.filter((att) => att.id !== attachment_id)
        await this.update({ attachments: updatedAttachments })
        return this
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + item.unit_price * item.quantity, 0)
    }

    getTotal() {
        return this.getSubtotal() + this.additional_charges - this.discount
    }

    async exportPdf() {
        const fields: PdfField[] = [
            { name: "order_number", value: this.number },
            { name: "order_date", value: this.order_date.toLocaleString("pt-br") },
            { name: "order_validity", value: this.validity?.toLocaleString("pt-br") },
            { name: "customer_name", value: this.customer.name },
            { name: "customer_email", value: this.customer.email },
            { name: "customer_cpf_cnpj", value: this.customer.cpf_cnpj },
            { name: "customer_rg_ie", value: this.customer.rg_ie },
            { name: "customer_address", value: this.customer.address },
            { name: "customer_neighborhood", value: this.customer.neighborhood },
            { name: "customer_city", value: this.customer.city },
            { name: "customer_state", value: this.customer.state },
            { name: "customer_phone", value: this.customer.phone },
            { name: "customer_cep", value: this.customer.cep },

            { name: "order_discount", value: currencyMask(this.discount) },
            { name: "order_additional_charges", value: currencyMask(this.additional_charges) },
            { name: "order_subtotal", value: currencyMask(this.getSubtotal()) },
            { name: "order_total", value: currencyMask(this.getTotal()) },

            { name: "order_payment_terms", value: this.payment_terms },
            { name: "order_notes", value: this.notes },
        ]

        for (const [index, item] of this.items.entries()) {
            fields.push(
                { name: `item_${index}`, value: (index + 1).toString() },
                { name: `quantity_${index}`, value: item.quantity.toString() },
                { name: `description_${index}`, value: item.description },
                { name: `price_${index}`, value: currencyMask(item.unit_price) }
            )
        }

        const pdf = new PdfHandler({
            fields,
            template_path: "src/templates/procar_form.pdf",
            output_dir: "static/orders",
            filename: `Pedido_${this.customer.name.replace(/\s+/g, "_")}_${this.number}.pdf`,
        })

        await pdf.fillForm()
        return pdf.fullpath
    }
}
