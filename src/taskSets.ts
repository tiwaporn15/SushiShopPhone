export type TaskNo = 1 | 2
export type SetId = 'A' | 'B' | 'C'

export interface TargetLine {
  itemId: string
  qty: number
}

export interface TaskSetDef {
  task: TaskNo
  set: SetId
  lines: TargetLine[]
}
/**
 * ชุดโจทย์สำหรับงานวิจัย (จากเอกสาร UXUI.pdf)
 * itemId อ้างอิงรูปแบบ `${groupId}-${index}` ตามที่ menuData.ts สร้างด้วย makeItems()
 * Task 1 = 2 รายการ / รวม 3 หน่วย, Task 2 = 5 รายการ / รวม 7 หน่วย (ตรงตามเอกสารต้นฉบับ)
 */
export const TASK_SETS: readonly TaskSetDef[] = [
  // Task 1 — Easy
  {
    task: 1,
    set: 'A',
    lines: [
      { itemId: 'tuna-salmon-3', qty: 2 }, // แซลมอน
      { itemId: 'desserts-3', qty: 1 }, // ชาเขียวเย็น
    ],
  },
  {
    task: 1,
    set: 'B',
    lines: [
      { itemId: 'tuna-salmon-1', qty: 2 }, // มะกุโระ
      { itemId: 'desserts-4', qty: 1 }, // น้ำอัดลม
    ],
  },
  {
    task: 1,
    set: 'C',
    lines: [
      { itemId: 'shrimp-crab-shellfish-1', qty: 2 }, // กุ้งเอบิ
      { itemId: 'desserts-3', qty: 1 }, // ชาเขียวเย็น
    ],
  },

  // Task 2 — Complex
  {
    task: 2,
    set: 'A',
    lines: [
      { itemId: 'tuna-salmon-6', qty: 2 }, // ท้องแซลมอนเบิร์นไฟ
      { itemId: 'squid-octopus-eel-6', qty: 2 }, // อุนางิย่าง
      { itemId: 'tuna-salmon-22', qty: 1 }, // แซลมอนอะโวคาโดโรล
      { itemId: 'desserts-1', qty: 1 }, // ไอศกรีมมัทฉะ
      { itemId: 'desserts-3', qty: 1 }, // ชาเขียวเย็น
    ],
  },
  {
    task: 2,
    set: 'B',
    lines: [
      { itemId: 'tuna-salmon-4', qty: 2 }, // ท้องแซลมอน
      { itemId: 'shrimp-crab-shellfish-22', qty: 2 }, // หอยเชลล์จัมโบ้
      { itemId: 'tuna-salmon-11', qty: 1 }, // ทูน่ามากิ
      { itemId: 'desserts-2', qty: 1 }, // ไดฟูกุถั่วแดง
      { itemId: 'desserts-4', qty: 1 }, // น้ำอัดลม
    ],
  },
  {
    task: 2,
    set: 'C',
    lines: [
      { itemId: 'tuna-salmon-3', qty: 2 }, // แซลมอน
      { itemId: 'squid-octopus-eel-6', qty: 2 }, // อุนางิย่าง
      { itemId: 'tuna-salmon-12', qty: 1 }, // ทูน่าสับมากิ
      { itemId: 'sides-2', qty: 1 }, // ไก่คาราอาเกะ
      { itemId: 'desserts-3', qty: 1 }, // ชาเขียวเย็น
    ],
  },
]

export function findTaskSet(task: TaskNo, set: SetId): TaskSetDef | undefined {
  return TASK_SETS.find((t) => t.task === task && t.set === set)
}
