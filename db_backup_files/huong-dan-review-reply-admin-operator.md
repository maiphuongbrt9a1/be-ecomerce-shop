# Huong dan them chuc nang admin/operator tra loi review

## Muc tieu

Them chuc nang de `ADMIN` va `OPERATOR` co the tra loi review cua `CUSTOMER` ngay trong phan review.

## Tang co so hien tai

- Da xem `src/reviews/reviews.service.ts`
- Da xem `src/reviews/reviews.controller.ts`
- Da kiem tra `prisma/schema.prisma` tai model `Reviews`

## Huong thuc hien

### Buoc 1: Cap nhat Prisma Schema

Them model `ReviewReply` vao `prisma/schema.prisma`:

```prisma
model ReviewReply {
  id          BigInt      @db.BigInt @id @default(autoincrement())
  review      Reviews     @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  reviewId    BigInt      @db.BigInt
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      BigInt      @db.BigInt
  comment     String      @db.Text
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([reviewId], name: "idx_reply_review_id")
  @@index([userId], name: "idx_reply_user_id")
}
```

Cap nhat model `Reviews`:

```prisma
model Reviews {
  // ... existing fields
  replies     ReviewReply[]
}
```

### Buoc 2: Tao migration

```bash
npx prisma migrate dev --name add_review_reply
```

### Buoc 3: Tao DTOs

Tao `src/reviews/dto/create-review-reply.dto.ts`:

```typescript
export class CreateReviewReplyDto {
  reviewId: number;
  userId: number;
  comment: string;
}
```

Tao `src/reviews/dto/update-review-reply.dto.ts`:

```typescript
export class UpdateReviewReplyDto {
  comment?: string;
}
```

### Buoc 4: Tao Entity

Tao `src/reviews/entities/review-reply.entity.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class ReviewReplyEntity {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 1 })
  reviewId: bigint;

  @ApiProperty({ example: 1 })
  userId: bigint;

  @ApiProperty({ example: 'Thanks for your feedback!' })
  comment: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

### Buoc 5: Them methods vao service

Them cac methods vao `src/reviews/reviews.service.ts`:

```typescript
async createReply(createReviewReplyDto: CreateReviewReplyDto): Promise<ReviewReply> {
  return await this.prismaService.reviewReply.create({
    data: createReviewReplyDto,
  });
}

async getRepliesByReviewId(reviewId: number): Promise<ReviewReply[]> {
  return await this.prismaService.reviewReply.findMany({
    where: { reviewId },
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

async updateReply(id: number, updateReviewReplyDto: UpdateReviewReplyDto): Promise<ReviewReply> {
  return await this.prismaService.reviewReply.update({
    where: { id },
    data: updateReviewReplyDto,
  });
}

async deleteReply(id: number): Promise<ReviewReply> {
  return await this.prismaService.reviewReply.delete({
    where: { id },
  });
}
```

### Buoc 6: Them endpoints vao controller

Them vao `src/reviews/reviews.controller.ts`:

```typescript
@Post(':reviewId/replies')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN', 'OPERATOR')
async createReply(
  @Param('reviewId') reviewId: string,
  @Body() createReviewReplyDto: CreateReviewReplyDto,
  @Request() req: RequestWithUserInJWTStrategy,
) {
  createReviewReplyDto.reviewId = +reviewId;
  createReviewReplyDto.userId = +req.user.userId;
  return await this.reviewsService.createReply(createReviewReplyDto);
}

@Get(':reviewId/replies')
@Public()
async getRepliesByReviewId(@Param('reviewId') reviewId: string) {
  return await this.reviewsService.getRepliesByReviewId(+reviewId);
}

@Patch('replies/:replyId')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN', 'OPERATOR')
async updateReply(
  @Param('replyId') replyId: string,
  @Body() updateReviewReplyDto: UpdateReviewReplyDto,
) {
  return await this.reviewsService.updateReply(+replyId, updateReviewReplyDto);
}

@Delete('replies/:replyId')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('ADMIN', 'OPERATOR')
async deleteReply(@Param('replyId') replyId: string) {
  return await this.reviewsService.deleteReply(+replyId);
}
```

### Buoc 7: Cap nhat findAll de include replies

Trong `findAll` cua service, them replies vao include neu can hien thi them trong list:

```typescript
productVariant: { include: { replies: true } },
```

## Tom tat

- Chi `ADMIN` va `OPERATOR` duoc reply
- `CUSTOMER` co the xem replies qua public endpoint
- Co the edit/delete replies neu can
- Replies se duoc sap xep theo `createdAt`

## Ghi chu

Day la note de xem lai sau, khong thay doi logic hien tai.
