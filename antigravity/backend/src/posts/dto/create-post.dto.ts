import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(140)
  content: string;
}
