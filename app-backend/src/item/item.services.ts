import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import Item, { ItemCategory, Itemplate, ItemStatut } from "./item.entity";
import Users from "src/user/user.entity";


export const Items: Itemplate[] = [
	{
		id: 1,
		name: "Fire Background",
		price: 500,
		description: "A background with fire",
		image: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/items/1272160/1a44c57d0db1f5ce697124473aba9a16ede5846c.mp4",
		category: ItemCategory.Background,
	},
	{
		id: 2,
		name: "Code Background",
		price: 500,
		description: "A background with code",
		image: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/items/2256790/d7d3fcfc0e4efa94bfbbb6fb7d6dc8e10cfd00e8.mp4",
		category: ItemCategory.Background,
	},
	{
		id: 3,
		name: "Blackhole",
		price: 2000,
		description: "A blackhole",
		image: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/items/1263950/4d466f77edf3265a253fba79d47bc91a37e34920.webm",
		category: ItemCategory.Background,
	},
	{
		id: 4,
		name: "Ink Background",
		price: 500,
		description: "A background with ink",
		image: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/items/1263950/931ccccf84db553f8f87a2dd01e1578839ba7457.webm",
		category: ItemCategory.Background,
	},
	{
		id: 5,
		name: "Neon",
		price: 500,
		description: "A neon background",
		image: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/items/601220/b2aebf7aaba89d41fe7cc2c6d0a1f9793cda3b0d.mp4",
		category: ItemCategory.Background,
	},
	{
		id: 6,
		name: "Speed of light",
		price: 500,
		description: "A speed light",
		image: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/items/601220/35008464b7252317324727c4415a47b4ff07323d.mp4",
		category: ItemCategory.Background,
	},
	{
		id: 7,
		name: "It's PONG",
		price: 500,
		description: "It's PONG",
		image: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/items/531510/add876032c02604ba36c4c26922873ec8b7d9fab.mp4",
		category: ItemCategory.Background,
	},
	{
		id: 8,
		name: "tHE SPACE",
		price: 500,
		description: "Trop chmims ^^",
		image: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/items/1061180/fb7ea02ea940342255337eba0bbf5598b30333b3.mp4",
		category: ItemCategory.Background,
	},
	{
		id: 9,
		name: "Red Pad",
		price: 300,
		description: "Red Pad",
		image: "Red",
		category: ItemCategory.Pad,
	},
	{
		id: 10,
		name: "Cyan Pad",
		price: 300,
		description: "Cyan Pad",
		image: "Cyan",
		category: ItemCategory.Pad,
	},
	{
		id: 11,
		name: "Green Pad",
		price: 300,
		description: "Green Pad",
		image: "Greenyellow",
		category: ItemCategory.Pad,
	},
	{
		id: 12,
		name: "Magenta Ball",
		price: 200,
		description: "Magenta Ball",
		image: "Magenta",
		category: ItemCategory.Ball,
	},
	{
		id: 13,
		name: "Blue Ball",
		price: 200,
		description: "Blue Ball",
		image: "Blue",
		category: ItemCategory.Ball,
	},
	{
		id: 14,
		name: "Yellow Ball",
		price: 200,
		description: "Yellow Ball",
		image: "yellow",
		category: ItemCategory.Ball,
	},
	{
		id: 15,
		name: "Transparent Pad",
		price: 1000,
		description: "Transparent Pad",
		image: "",
		category: ItemCategory.Pad,
	},
	{
		id: 16,
		name: "Transparent Ball",
		price: 1000,
		description: "Transparent Ball",
		image: "",
		category: ItemCategory.Ball,
	}
];

@Injectable()
export class ItemService {
    constructor(
        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,
     ) {}
    
    async createItem(id: number, user: Users) : Promise<Item> {
        const newItem : Item = await this.itemRepository.create({
            itemId: id,
			category: Items[id].category,
            owner: user
        })
        return await this.itemRepository.save(newItem);
    }

	async getShop(user: Users) : Promise<Item[]> {
		return await this.itemRepository.createQueryBuilder("item")
		.select()
		.leftJoinAndSelect("item.owner", "owner")
		.where("item.owner = :owner", {owner: user.id})
		.getMany();
	}

    async getItemByIdAndUser(id: number, owner: Users) : Promise<Item> {
        return await this.itemRepository.createQueryBuilder("item")
        .select()
        .leftJoinAndSelect("item.owner", "owner")
        .where("item.itemId = :id", {id: id})
        .andWhere("item.owner = :owner", {owner: owner.id})
        .getOne();
    }

    async getItemPriceById(id: number) : Promise<number> {
        return (Items[id].price);
    }

	async getEquipedItem(user: Users, category: ItemCategory) : Promise<Item> {
		return await this.itemRepository.createQueryBuilder("item")
		.select()
		.leftJoinAndSelect("item.owner", "owner")
		.where("item.owner = :owner", {owner: user.id})
		.andWhere("item.statut = :statut", { statut: ItemStatut.Equiped })
		.andWhere("item.category = :category", { category: category })
		.getOne();
	}

    async changeItemStatut(item: Item, user: Users) {
        if (item.statut === ItemStatut.Owned) {
			item.statut = ItemStatut.Equiped;
			const equipedItem = await this.getEquipedItem(user, item.category);
			if (equipedItem) {
				equipedItem.statut = ItemStatut.Owned;
				this.itemRepository.save(equipedItem);
			}
		}
		else
			item.statut = ItemStatut.Owned;
        this.itemRepository.save(item);
		return Items[item.itemId];
    }
}