# SWD Frontend Test

โปรเจกต์นี้เป็นระบบฟอร์มและตารางสำหรับจัดการข้อมูลพนักงาน สร้างด้วย Next.js, TypeScript, Ant Design, Redux Toolkit และ i18n รองรับทั้งภาษาไทยและภาษาอังกฤษ

## คุณสมบัติหลัก

- กรอกข้อมูลพนักงานผ่านฟอร์ม
- แสดงข้อมูลในตาราง พร้อมแก้ไขและลบรายการได้
- เปลี่ยนภาษาไทย / อังกฤษได้
- เก็บข้อมูลลง `localStorage`
- ข้อมูลสัญชาติรองรับทั้งภาษาไทยและภาษาอังกฤษ
- มี validation สำหรับเบอร์โทร, Passport No และ Expected Salary

## เทคโนโลยีที่ใช้

- Next.js 14
- React 18
- TypeScript
- Ant Design
- Redux Toolkit
- react-i18next
- SweetAlert2
- dayjs

## ข้อกำหนดก่อนเริ่ม

- ต้องใช้ **Node.js เวอร์ชัน 20 ขึ้นไป**
- แนะนำให้ใช้ package manager แค่ตัวเดียวต่อโปรเจกต์

โปรเจกต์นี้มีทั้ง `package-lock.json` และ `yarn.lock`
ถ้าจะใช้ `npm` ให้ใช้ `npm` ต่อเนื่อง
ถ้าจะใช้ `yarn` ให้ใช้ `yarn` ต่อเนื่อง และไม่ควรสลับกัน

## ลำดับคำสั่งสำหรับขึ้นโปรเจกต์

### วิธีที่ 1: ใช้ npm

1. clone โปรเจกต์

```bash
git clone https://github.com/herorshi/swd-frontend-test.git
```

2. เข้าโฟลเดอร์โปรเจกต์

```bash
cd -- "swd-frontend-test"
```

3. ตรวจสอบเวอร์ชัน Node.js

```bash
node -v
```

4. ติดตั้ง dependencies

```bash
npm install
```

5. รันโปรเจกต์แบบ development

```bash
npm run dev
```

6. เปิดเว็บที่

```bash
http://localhost:3000
```

### วิธีที่ 2: ใช้ yarn

1. clone โปรเจกต์

```bash
git clone https://github.com/herorshi/swd-frontend-test.git
```

2. เข้าโฟลเดอร์โปรเจกต์

```bash
cd -- "swd-frontend-test"
```

3. ตรวจสอบเวอร์ชัน Node.js

```bash
node -v
```

4. ติดตั้ง dependencies

```bash
yarn install
```

5. รันโปรเจกต์แบบ development

```bash
yarn dev
```

6. เปิดเว็บที่

```bash
http://localhost:3000
```

## คำสั่งที่ใช้บ่อย

รัน development server:

```bash
npm run dev
```

build production:

```bash
npm run build
```

run production server:

```bash
npm run start
```

ตรวจ lint:

```bash
npm run lint
```

## โครงสร้างไฟล์สำคัญ

- `src/app/page.tsx` หน้าแบบฟอร์มและตารางหลัก
- `src/app/page.module.css` style ของหน้า
- `src/store/` Redux store และ slices
- `src/store/storage.ts` จัดการ `localStorage`
- `src/i18n/resources.ts` ข้อความภาษาไทยและอังกฤษ
- `src/types/employee.ts` type ของข้อมูลพนักงาน

## การทำงานของข้อมูล

- ข้อมูลรายการพนักงานจะถูกเก็บลง `localStorage`
- เมื่อรีเฟรชหน้า ข้อมูลจะยังอยู่
- ข้อมูลสัญชาติถูกเก็บทั้ง `en` และ `th` เพื่อให้สลับภาษาแล้วแสดงผลได้ถูกต้อง

## Validation ที่มีในระบบ

- `Mobile Phone` ต้องเป็นตัวเลข 10 หลัก และขึ้นต้นด้วย `0`
- `Passport No` กรอกได้เฉพาะตัวเลข
- `Expected Salary` กรอกได้เฉพาะตัวเลข และแสดง comma อัตโนมัติ

## หมายเหตุ

- ถ้าเปลี่ยนภาษา ข้อความในฟอร์มและค่าของสัญชาติในตารางจะเปลี่ยนตามภาษาที่เลือก
- ค่าที่แสดงในฟอร์มบางส่วนถูกจัด format เพื่อให้กรอกง่ายขึ้น แต่ค่าที่เก็บยังเป็นรูปแบบที่เหมาะกับการใช้งานในระบบ
