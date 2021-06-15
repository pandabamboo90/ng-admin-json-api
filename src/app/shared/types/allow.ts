export type AllowAction = 'create' | 'view' | 'update' | 'destroy' | 'send_money' | 'receive' | 'reject' | 'approve';

export type AllowTo = { [key in `allow_to_${ AllowAction }`]: boolean };
