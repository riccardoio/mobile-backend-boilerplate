import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";

@Entity("users") 
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "supabase_id", unique: true })
  supabaseId: string;

  @Column()
  email: string;

  @Column({ name: "is_paid", default: false })
  isPaid: boolean;

  @Column()
  plan: string;

  @Column({ name: "next_billing_at", type: "timestamp", nullable: true })
  nextBillingAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

} 