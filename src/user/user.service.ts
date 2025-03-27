import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { initialUsers } from './utils/user.seed';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login-dto';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const userCount = await this.userModel.countDocuments();
    if (userCount < 3) {
      await this.autoCreateDefaultUsers();
    }
  }

  // Create default user to test endpoint
  async autoCreateDefaultUsers() {
    try {
      //   populate initial user
      for (const userData of initialUsers) {
        const existingUser = await this.userModel.findOne({
          username: userData.username,
        });
        if (!existingUser) {
          const newUser = new this.userModel({
            username: userData.username,
            password: userData.password,
          });
          await newUser.save();
          console.log(`User "${userData.username}" created.`);
        } else {
          console.log(`User "${userData.username}" already exists. Skipping.`);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // User login
  async login(dto: LoginDto) {
    try {
      const { username, password } = dto;

      // check if user exist
      const user = await this.userModel.findOne({
        username: username,
      });
      if (!user) throw new NotFoundException('user not found');

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }

      const payload = { username: username, sub: user._id };

      const token = this.jwtService.sign(payload);
      return {
        message: 'User login successfully',
        token: token,
      };
    } catch (error) {
      throw error;
    }
  }
}
