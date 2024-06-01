import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { UserStatusType } from '../user-management.enum';

@Entity({
  name: 'user',
  schema: 'user-management',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @Column({ type: 'simple-enum', enum: UserStatusType })
  status: UserStatusType;

  @Column({ nullable: true })
  avatar?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @Column({ name: 'created_by', nullable: false })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: string;

  @VersionColumn()
  version?: number;

  @Column({ name: 'last_login', nullable: true })
  lastLogin?: Date;
}
