import { IsOptional, IsString } from 'class-validator';

export class UserCreateDto {
  name!: string;
  username!: string;
  email!: string;
  password!: string;
  profilePic?: string;
}

export class UserResponseDto {
  id!: string;
  name!: string;
  username!: string;
  email!: string;
  password!: string;
  profilePic!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  disabledAt!: Date | null;
}

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  profilePic?: string;
}
