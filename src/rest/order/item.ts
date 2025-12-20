import express, { Express, Request, Response } from "express"
import { OrderRequest, requireOrderId } from "../../middlewares/requireOrderId"
import { Item } from "../../class/Item"
import { Order } from "../../class/Order"

const router: express.Router = express.Router()

router.get("/", async (request: Request, response: Response) => {
    try {
        const query = request.query.query as string | undefined
        if (!query) {
            const list = await Item.list()
            return response.json(list)
        }

        console.log(`Searching items with query: ${query}`)
        const results = await Item.query(query)
        console.log(results)
        return response.json(results)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.post("/", async (request: Request, response: Response) => {
    const data = request.body as Item
    const order_id = request.query.order_id as string | undefined

    try {
        console.log(data)
        const item = await Item.upsert(data)

        if (order_id) {
            const order = await Order.get(order_id)
            if (!order) {
                return response.status(404).send("Order not found")
            }

            order.items.push(item)
            await order.update({ items: order.items })
        }

        return response.json(item)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.put("/", async (request: Request, response: Response) => {
    const data = request.body as Item
    const order_id = request.query.order_id as string | undefined

    try {
        if (order_id) {
            const order = await Order.get(order_id)
            if (!order) {
                return response.status(404).send("Order not found")
            }
            for (const item of order.items) {
                if (item.id === data.id) {
                    Object.assign(item, data)

                    await order.update({ items: order.items })
                    return response.json(item)
                }
            }
        } else {
            const item = await Item.update(data)
            return response.json(item)
        }
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.delete("/", async (request: Request, response: Response) => {
    const order_id = request.query.order_id as string | undefined
    const item_id = request.query.item_id as string | undefined

    if (!item_id) {
        return response.status(400).send("item_id is required")
    }

    try {
        if (order_id) {
            const order = await Order.get(order_id)
            if (!order) {
                return response.status(404).send("Order not found")
            }
            order.items = order.items.filter((item) => item.id !== item_id)
            await order.update({ items: order.items })
            return response.status(204).json(order)
        } else {
            await Item.delete(item_id)
            return response.status(204).send()
        }
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

export default router
