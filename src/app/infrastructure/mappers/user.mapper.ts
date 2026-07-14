import { User } from '../../domain/entities/user.entity';
import { UserDto } from '../models/user.dto';

export class UserMapper {
  static toDomain(userDto: UserDto): User {
    return {
      userEmail: userDto.user.email,
      userName: userDto.user.name,
    };
  }
}
