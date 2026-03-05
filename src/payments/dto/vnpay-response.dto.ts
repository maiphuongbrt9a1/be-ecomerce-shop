import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VNPayBankResponseDto {
  @ApiProperty({ example: 'VIETCOMBANK' })
  bank_code: string;

  @ApiProperty({ example: 'Ngân hàng VietcomBank' })
  bank_name: string;

  @ApiProperty({
    example: 'https://sandbox.vnpayment.vn/images/bank/vietcombank_logo.png',
  })
  logo_link: string;

  @ApiProperty({ example: 1 })
  bank_type: number;

  @ApiProperty({ example: 1 })
  display_order: number;
}

export class VNPayVerifyReturnUrlResponseDto {
  // ============ RETURNED REQUEST DATA ============
  @ApiProperty({
    description: 'Merchant TMN code',
    example: 'L62FDD2R',
  })
  vnp_TmnCode: string;

  @ApiProperty({
    description: 'Payment amount (converted back from multiplied by 100)',
    example: 150000,
  })
  vnp_Amount: number;

  @ApiProperty({
    description: 'Bank code used for payment',
    example: 'NCB',
  })
  vnp_BankCode: string;

  @ApiProperty({
    description: 'Payment description from original transaction',
    example: 'Thanh toan don hang 12345',
  })
  vnp_OrderInfo: string;

  @ApiProperty({
    description: 'Transaction code recorded in VNPAY system',
    example: '20170829153052',
  })
  vnp_TransactionNo: string;

  @ApiProperty({
    description: 'Response code from VNPAY (00 = success)',
    example: '00',
  })
  vnp_ResponseCode: string;

  @ApiProperty({
    description: 'Transaction status at VNPAY (00 = successful)',
    example: '00',
  })
  vnp_TransactionStatus: string;

  @ApiProperty({
    description: 'Merchant transaction reference from original request',
    example: 'ORDER_12345',
  })
  vnp_TxnRef: string;

  // ============ VERIFICATION RESULT ============
  @ApiProperty({
    description: 'Whether the secure hash is verified (true = valid signature)',
    example: false,
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Whether the payment is successful (true = payment processed)',
    example: true,
  })
  isSuccess: boolean;

  @ApiProperty({
    description: 'Verification result message',
    example: 'Wrong checksum',
  })
  message: string;

  // ============ OPTIONAL FIELDS ============
  @ApiPropertyOptional({
    description: 'Transaction code at bank',
    example: 'NCB20170829152730',
  })
  vnp_BankTranNo?: string;

  @ApiPropertyOptional({
    description: 'Type of account/card used: ATM, QRCODE',
    example: 'ATM',
  })
  vnp_CardType?: string;

  @ApiPropertyOptional({
    description: 'Payment date - Format: yyyyMMddHHmmss',
    example: '20170829152730',
  })
  vnp_PayDate?: string;
}

export class VNPayVerifyIpnCallResponseDto {
  @ApiProperty({ example: true })
  isSuccess: boolean;

  @ApiProperty({ example: 'verify-ipn-success' })
  message: string;

  @ApiPropertyOptional({ example: '00' })
  vnp_ResponseCode?: string;

  @ApiPropertyOptional({ example: 'ORDER_12345' })
  vnp_TxnRef?: string;
}

export class VNPayQueryDrResponseDto {
  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty({ example: true })
  isSuccess: boolean;

  @ApiProperty({ example: 'Yêu cầu thành công' })
  message: string;

  @ApiProperty({ example: 'cb976ea7344c41918c8535304b41ab53' })
  vnp_ResponseId: string;

  @ApiProperty({ example: 'querydr' })
  vnp_Command: string;

  @ApiProperty({ example: '00' })
  vnp_ResponseCode: string;

  @ApiProperty({ example: 'Yêu cầu thành công' })
  vnp_Message: string;

  @ApiProperty({ example: 'L62FDD2R' })
  vnp_TmnCode: string;

  @ApiProperty({ example: 'ORDER_12345' })
  vnp_TxnRef: string;

  @ApiProperty({ example: '15000000' })
  vnp_Amount: string;

  @ApiProperty({ example: 'Thanh toan don hang 12345' })
  vnp_OrderInfo: string;

  @ApiProperty({ example: 'NCB' })
  vnp_BankCode: string;

  @ApiProperty({ example: '20260305092345' })
  vnp_PayDate: string;

  @ApiProperty({ example: '4941749' })
  vnp_TransactionNo: string;

  @ApiProperty({ example: '01' })
  vnp_TransactionType: string;

  @ApiProperty({ example: '08' })
  vnp_TransactionStatus: string;

  @ApiProperty({
    example:
      '0e78707e177d0b505c1f155f7fd64ae3c4fb44188a14261e5b54fa7f745ebf4c07df2735faf2548a23bafa8fc7536c4ab518dcaf2c1b0d67ada2abc6b75ff3e0',
  })
  vnp_SecureHash: string;
}

export class VNPayRefundResponseDto {
  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty({ example: false })
  isSuccess: boolean;

  @ApiProperty({ example: 'Checksum không hợp lệ' })
  message: string;

  @ApiProperty({ example: '1f773f4b4a224fd9a45dd0c9e9d7a024' })
  vnp_ResponseId: string;

  @ApiProperty({ example: 'refund' })
  vnp_Command: string;

  @ApiProperty({ example: '97' })
  vnp_ResponseCode: string;

  @ApiProperty({ example: 'Checksum không hợp lệ' })
  vnp_Message: string;
}
