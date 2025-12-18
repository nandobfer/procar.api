import express, { Express, Request, Response } from "express"
import { OrderRequest, requireOrderId } from "../../middlewares/requireOrderId"
import { Item } from "../../class/Item"
import { ItemRequest, requireItemId } from "../../middlewares/requireItemId"

const router: express.Router = express.Router()

router.post("/", requireOrderId, async (request: OrderRequest, response: Response) => {
    const data = request.body as Item

    try {
        console.log(data)
        const order = request.order!
        order.items.push(new Item(data))
        await order.update({ items: order.items })
        return response.json(order)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.put("/", requireOrderId, async (request: OrderRequest, response: Response) => {
    const data = request.body as Item

    try {
        const order = request.order!

        for (const item of order.items) {
            if (item.id === data.id) {
                Object.assign(item, data)
            }
        }
        await order.update({ items: order.items })
        return response.json(order)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

router.delete("/", requireItemId, async (request: ItemRequest, response: Response) => {
    try {
        const order = request.order!
        order.items = order.items.filter((item) => item.id !== request.item!.id)
        await order.update({ items: order.items })
        return response.status(204).json(order)
    } catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
})

export default router
