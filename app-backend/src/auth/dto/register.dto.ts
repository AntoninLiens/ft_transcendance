import { IsString, IsNotEmpty, MinLength, MaxLength } from "class-validator";

export default class RegisterDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(10)
	name: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(7)
	password: string;

	@IsString()
	@IsNotEmpty()
	pfp: string;
}