import {
  Children,
  isValidElement,
  useState,
  useId,
  type PropsWithChildren,
} from "react";
import { Tab } from "./tab";
import type { TabProps } from "./tab";

type TabsProps = PropsWithChildren<{
  defaultActiveTab?: string;
  ariaLabel?: string;
}>;

const Tabs = ({ children, defaultActiveTab, ariaLabel }: TabsProps) => {
  const uid = useId();

  const tabs = Children.toArray(children)
    .filter(
      (child): child is React.ReactElement<TabProps> =>
        isValidElement(child) && child.type === Tab,
    )
    .map((child) => child.props);

  const [activeTab, setActiveTab] = useState<string>(
    defaultActiveTab && tabs.some((t) => t.tabId === defaultActiveTab)
      ? defaultActiveTab
      : (tabs[0]?.tabId ?? ""),
  );

  return (
    <div className="flex flex-col md:flex-1 md:min-h-0">
      <div
        role="tablist"
        {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
        className="flex border-b border-stone-200 px-6"
      >
        {tabs.map(({ tabId, tabTitle }) => (
          <button
            key={tabId}
            role="tab"
            id={`${uid}-tab-${tabId}`}
            aria-selected={activeTab === tabId}
            aria-controls={`${uid}-panel-${tabId}`}
            onClick={() => setActiveTab(tabId)}
            className={[
              "min-h-[50px] px-6 text-sm font-medium transition-colors capitalize",
              activeTab === tabId
                ? "border-b-2 border-accent-500 text-accent-600"
                : "text-stone-500 hover:text-stone-700",
            ].join(" ")}
          >
            {tabTitle ?? tabId}
          </button>
        ))}
      </div>

      {tabs.map(({ tabId, children: content }) => (
        <div
          key={tabId}
          role="tabpanel"
          id={`${uid}-panel-${tabId}`}
          aria-labelledby={`${uid}-tab-${tabId}`}
          hidden={activeTab !== tabId}
          className="px-6 md:flex-1 md:min-h-0 md:overflow-y-auto"
        >
          {content}
        </div>
      ))}
    </div>
  );
};

export type { TabsProps };
export { Tabs };
