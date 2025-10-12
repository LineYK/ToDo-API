import { IsNotEmpty, IsString } from "class-validator";

export class AuthResponseDto {
    @IsString()
    @IsNotEmpty()
    accessToken: string;
}