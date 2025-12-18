import express, { Express, Request, Response, Router } from "express"
import { Attachment, Order, OrderForm } from "../../class/Order"
import { OrderRequest, requireOrderId } from "../../middlewares/requireOrderId"
import item from "./item"
import { Customer } from "../../class/Customer"
import { UploadedFile } from "express-fileupload"

const router: Router = express.Router()

router.use("/item", requireOrderId, item)

router.get("/", async (request: Request, response: Response) => {
    const order_id = request.query.order_id as string | undefined

    console.log("getting request")

    try {
        if (order_id) {
            const order = await Order.get(order_id)
            if (order) return response.json(order)
            return response.status(404).send("Order not found")
        }

        const list = await Order.list()
        return response.json(list)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.post("/", async (request: Request, response: Response) => {
    const data = request.body as OrderForm

    try {
        const order = await Order.create(data)
        console.log("created order:", order)
        return response.json(order)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.put("/", requireOrderId, async (request: OrderRequest, response: Response) => {
    const data = request.body as OrderForm

    console.log("updating order:", data)

    try {
        const order = request.order!
        await order.update(data)
        return response.json(order)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.delete("/", requireOrderId, async (request: OrderRequest, response: Response) => {
    try {
        await request.order!.delete()
        return response.status(204).send()
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.get("/next-available-number", async (request: Request, response: Response) => {
    try {
        const number = await Order.getNextAvailableNumber()
        return response.json(number)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.get("/query", async (request: Request, response: Response) => {
    const query = request.query.query as string
    try {
        const result = await Order.query(query)
        console.log("order query result:", result)
        return response.json(result)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.get("/query-customer", async (request: Request, response: Response) => {
    const query = request.query.query as string
    try {
        const result = await Customer.query(query)
        return response.json(result.slice(0, 10))
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.get("/validate-number", async (request: Request, response: Response) => {
    const number = request.query.number as string

    try {
        const valid = await Order.validateNumber(number)
        return response.json(valid)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})
router.post("/image", requireOrderId, async (request: OrderRequest, response: Response) => {
    try {
        const order = request.order!
        const files = request.files
        const data = JSON.parse(request.body.data) as Attachment[]

        console.log("uploading images:", data)

        if (!files || !data) {
            return response.status(400).send("Invalid files or data")
        }

        const images: UploadedFile[] = []

        for (const [index, attachment] of data.entries()) {
            const file = files[`file${index}`]
            if (!file) {
                return response.status(400).send(`File file${index} not found`)
            }

            images.push(file as UploadedFile)
        }

        await order.uploadImages(images, data)

        return response.json(order)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.delete("/image", requireOrderId, async (request: OrderRequest, response: Response) => {
    const attachment_id = request.query.attachment_id as string
    if (!attachment_id) {
        return response.status(400).send("attachment_id is required")
    }

    console.log("deleting image:", attachment_id)

    try {
        const order = request.order!
        await order.deleteImage(attachment_id)
        return response.json(order)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.get("/pdf", requireOrderId, async (request: OrderRequest, response: Response) => {
    try {
        const order = request.order!
        const path = await order.exportPdf()
        return response.json(path)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

export default router
