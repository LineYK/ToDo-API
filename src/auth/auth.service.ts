import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {

        const existingUser = await this.usersRepository.findOne({ where: { email: registerDto.email } });
        if (existingUser) {
            throw new BadRequestException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = this.usersRepository.create({ 
            ...registerDto, 
            password: hashedPassword 
        });
        
        const savedUser = await this.usersRepository.save(user);

        return {
            accessToken: this.jwtService.sign({ sub: savedUser.id }),
        };
    }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.usersRepository.findOne({ where: { email: loginDto.email } });
        if (!user) {
            throw new BadRequestException('존재하지 않는 사용자입니다.');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('비밀번호가 일치하지 않습니다.');
        }

        return {
            accessToken: this.jwtService.sign({ sub: user.id }),
        };
    }

    async validateEmail(email: string): Promise<boolean> {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new BadRequestException('존재하지 않는 사용자입니다.');
        }

        return user ? true : false;
    }
}
