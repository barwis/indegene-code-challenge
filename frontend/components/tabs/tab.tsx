import type { PropsWithChildren, ReactNode } from "react";

type TabProps = PropsWithChildren<{
  tabId: string;
  tabTitle?: ReactNode;
}>;

const Tab = (_props: TabProps) => null;

export type { TabProps };
export { Tab };
