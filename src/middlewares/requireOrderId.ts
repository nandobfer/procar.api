import { NextFunction, Request, Response } from "express"
import { Order } from "../class/Order"

export interface OrderRequest extends Request {
    order?: Order | null
}

export const requireOrderId = async (request: OrderRequest, response: Response, next: NextFunction) => {
    const { order_id } = request.query

    if (!order_id) {
        return response.status(400).send("order_id param is required")
    }

    request.order = await Order.get(order_id as string)

    next()
}
