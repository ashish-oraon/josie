export interface IMeal {
  time: string;
  type: string;
  menu: string;
}

export interface IDay {
  day: string;
  meals: IMeal[];
  notes: string[];
}

export interface IDietPlan {
  title: string;
  days: IDay[];
}
