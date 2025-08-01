import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  DiningOption,
  Discount,
  Order,
  Store,
  TempOrder,
  Transaction,
} from '~/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

export const isStrongPassword = (password: string): boolean => {
  // At least 8 chars, 1 uppercase, 1 number, 1 special character
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/.test(password);
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const toTitleCase = (str: string) => {
  return (str || '').replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );
};

export const fetchImageFromUri = async (uri: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

export const maskNumber = (number: string) => {
  const str = number.toString();
  return str.slice(0, -4).replace(/./g, '*') + str.slice(-4);
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getTimeOfDay = (date = new Date()) => {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'afternoon';
  } else {
    return 'evening';
  }
};

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatNumber(num: number) {
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, '') + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

export function formatStringToNumber(str: string) {
  const value = parseFloat((str || '').toString().replace(/,/g, ''));

  if (isNaN(value)) {
    return 0;
  }

  return value;
}

export function calculateTotals(
  orders: Order[] | TempOrder[],
  diningOption: DiningOption,
  store: Store | null,
  discount: Discount | null,
) {
  const totalBeverageOrderAmount = orders.reduce((acc, order) => {
    if (order.menu?.category !== 'BEVERAGE') return acc;

    const selectionPrice = order.options.reduce((acc, option) => {
      return acc + Number(option.selectionPrice);
    }, 0);
    const addOnPrice = (order.addOns || []).reduce((acc, addOn) => {
      return acc + Number(addOn.price);
    }, 0);

    return (
      acc +
      order.qty * (Number(order.menu?.price) + selectionPrice + addOnPrice)
    );
  }, 0);

  const totalFoodOrderAmount = orders.reduce((acc, order) => {
    if (order.menu?.category !== 'FOOD') return acc;

    const selectionPrice = (order.options || []).reduce((acc, option) => {
      return acc + Number(option.selectionPrice);
    }, 0);
    const addOnPrice = (order.addOns || []).reduce((acc, addOn) => {
      return acc + Number(addOn.price);
    }, 0);

    return (
      acc +
      order.qty * (Number(order.menu?.price) + selectionPrice + addOnPrice)
    );
  }, 0);

  const totalAddOnsOrderAmount = orders.reduce((acc, order) => {
    if (!order.addOn) return acc;

    const addOnPrice = Number(order.addOn.price);

    return acc + order.qty * addOnPrice;
  }, 0);

  const totalFoodOrderWithServiceChargeAmount = orders.reduce((acc, order) => {
    if (
      order.menu?.category !== 'FOOD' ||
      order.menu?.hasServiceCharge === false
    ) {
      return acc;
    }

    const selectionPrice = order.options.reduce((acc, option) => {
      return acc + Number(option.selectionPrice);
    }, 0);
    const addOnPrice = (order.addOns || []).reduce((acc, addOn) => {
      return acc + Number(addOn.price);
    }, 0);

    return (
      acc +
      order.qty * (Number(order.menu?.price) + selectionPrice + addOnPrice)
    );
  }, 0);

  const totalAddOnsWithServiceChargeAmount = orders.reduce((acc, order) => {
    if (!order.addOn || order.addOn.hasServiceCharge === false) return acc;

    const addOnPrice = Number(order.addOn.price);

    return acc + order.qty * addOnPrice;
  }, 0);

  const quantity = orders.reduce((acc, order) => {
    return acc + order.qty;
  }, 0);

  const totalOrderAmount =
    totalBeverageOrderAmount + totalFoodOrderAmount + totalAddOnsOrderAmount;
  const subtotal = Number(
    (totalOrderAmount / (Number(store?.vatTaxPercentage) / 100)).toFixed(2),
  );
  const vat = discount && discount.isSpecial ? 0 : totalOrderAmount - subtotal;
  const discounted = Number(
    (discount
      ? (discount.isSpecial ? subtotal : subtotal + vat) *
        (Number(discount?.rate) / 100)
      : 0
    ).toFixed(2),
  );

  const totalWithServiceChargeAmount =
    totalFoodOrderWithServiceChargeAmount + totalAddOnsWithServiceChargeAmount;
  const togoCharge =
    diningOption === 'TO_GO' && totalWithServiceChargeAmount > 0
      ? Number(store?.togoCharge)
      : 0;

  let serviceCharge = 0;
  if (
    togoCharge <= 0 &&
    store?.serviceCharge &&
    totalWithServiceChargeAmount > 0
  ) {
    const lessVat = Number(
      (
        totalWithServiceChargeAmount /
        (Number(store?.vatTaxPercentage) / 100)
      ).toFixed(2),
    );
    const lessDiscount = Number(
      (discount ? Number(discount?.rate) / 100 : 0).toFixed(2),
    );
    serviceCharge = Number(
      (
        (lessVat - lessVat * lessDiscount) *
        (Number(store?.serviceChargePercentage) / 100)
      ).toFixed(2),
    );
  }

  const totalAmount = subtotal + vat - discounted + serviceCharge + togoCharge;

  return {
    quantity,
    subtotal,
    vat,
    discounted,
    serviceCharge,
    togoCharge,
    totalAmount: Number(totalAmount.toFixed(2)),
  };
}

export function calculateTransactionsTotals(
  transactions: Transaction[],
  store: Store | null,
) {
  const successTransactions = transactions.filter(
    (i) => i.status === 'SUCCESS',
  );

  const totalSalesWithVatEx = successTransactions
    .map((transaction) => {
      const discount = store?.discounts.find(
        (i) => i.id === transaction.discountId,
      );
      const { subtotal } = calculateTotals(
        transaction.orders || [],
        transaction.diningOption,
        store,
        discount || null,
      );
      return subtotal;
    })
    .reduce((acc, i) => acc + i, 0);

  const totalSalesWithVatInc = successTransactions
    .map((transaction) => transaction.amount)
    .reduce((acc, i) => acc + i, 0);

  const totalAmountByPaymentMethod = successTransactions
    .filter((i) => i.source === 'DINER')
    .reduce(
      (acc: Record<string, number>, transaction) => {
        const method = transaction.paymentMethod || 'Unknown';
        const amount = transaction.amount || 0;

        if (!acc[method]) {
          acc[method] = 0;
        }

        acc[method] += amount;
        return acc;
      },
      {} as Record<string, number>,
    );

  return {
    successTransactions,
    totalSalesWithVatEx,
    totalSalesWithVatInc,
    dinerSales: successTransactions
      .filter((i) => i.source === 'DINER')
      .map((transaction) => transaction.amount)
      .reduce((acc, i) => acc + i, 0),
    terminalSales: successTransactions
      .filter(
        (i) =>
          ['KIOSK', 'SERVICE'].includes(i.source) &&
          ['CREDIT_CARD', 'DEBIT_CARD'].includes(i.paymentMethod),
      )
      .map((transaction) => transaction.amount)
      .reduce((acc, i) => acc + i, 0),
    qrphSales: successTransactions
      .filter(
        (i) =>
          ['KIOSK', 'SERVICE'].includes(i.source) &&
          i.paymentMethod === 'QR_PH',
      )
      .map((transaction) => transaction.amount)
      .reduce((acc, i) => acc + i, 0),
    diner: {
      ...totalAmountByPaymentMethod,
    },
    kiosk: {
      creditCard: successTransactions
        .filter(
          (i) => i.paymentMethod === 'CREDIT_CARD' && i.source === 'KIOSK',
        )
        .map((transaction) => transaction.amount)
        .reduce((acc, i) => acc + i, 0),
      debitCard: successTransactions
        .filter((i) => i.paymentMethod === 'DEBIT_CARD' && i.source === 'KIOSK')
        .map((transaction) => transaction.amount)
        .reduce((acc, i) => acc + i, 0),
      qrph: successTransactions
        .filter((i) => i.paymentMethod === 'QR_PH' && i.source === 'KIOSK')
        .map((transaction) => transaction.amount)
        .reduce((acc, i) => acc + i, 0),
    },
    counter: {
      cash: successTransactions
        .filter(
          (i) =>
            i.paymentMethod === 'CASH' && (i.source === 'SERVICE' || !i.source),
        )
        .map((transaction) => transaction.amount)
        .reduce((acc, i) => acc + i, 0),
      creditCard: successTransactions
        .filter(
          (i) =>
            i.paymentMethod === 'CREDIT_CARD' &&
            (i.source === 'SERVICE' || !i.source),
        )
        .map((transaction) => transaction.amount)
        .reduce((acc, i) => acc + i, 0),
      debitCard: successTransactions
        .filter(
          (i) =>
            i.paymentMethod === 'DEBIT_CARD' &&
            (i.source === 'SERVICE' || !i.source),
        )
        .map((transaction) => transaction.amount)
        .reduce((acc, i) => acc + i, 0),
      qrph: successTransactions
        .filter(
          (i) =>
            i.paymentMethod === 'QR_PH' &&
            (i.source === 'SERVICE' || !i.source),
        )
        .map((transaction) => transaction.amount)
        .reduce((acc, i) => acc + i, 0),
      grabFood: 0,
    },
  };
}
