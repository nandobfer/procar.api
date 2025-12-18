export class Item {
    id: string
    description: string
    unit_price: number
    quantity: number

    constructor(data: Item) {
        this.id = data.id
        this.description = data.description
        this.unit_price = data.unit_price
        this.quantity = data.quantity
    }
}
