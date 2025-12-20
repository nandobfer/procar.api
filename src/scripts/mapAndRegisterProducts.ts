import { Item } from "../class/Item"
import { Order } from "../class/Order"

const mapAndRegisterProducts = async () => {
    const orders = await Order.list()

    for (const order of orders) {
        console.log(`Processing order ${order.number} (${order.id})`)
        for (const item of order.items) {
            await Item.new(item)
            console.log(`Registered item ${item.description} (${item.id})`)
        }
    }

    console.log("Done mapping and registering products.")
}

mapAndRegisterProducts()
