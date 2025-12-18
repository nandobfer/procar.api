import { NextFunction, Request, Response } from "express"
import { Item } from "../class/Item"
import { Order } from "../class/Order"

export interface ItemRequest extends Request {
    item?: Item | null
    order?: Order | null
}

export const requireItemId = async (request: ItemRequest, response: Response, next: NextFunction) => {
    const { item_id } = request.query

    if (!item_id) {
        return response.status(400).send("item_id param is required")
    }

    request.item = request.order?.items.find((item) => item.id === item_id)

    next()
}
