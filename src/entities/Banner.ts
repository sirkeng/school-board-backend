import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('banners')
export class Banner {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    videoUrl: string;
}
