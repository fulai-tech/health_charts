import { useEffect, useState } from 'react';
import { WidgetLayout } from '@/layouts/WidgetLayout';
import { Loader2 } from 'lucide-react';
import { useNativeBridge } from '@/hooks/useNativeBridge';
import { useTranslation } from 'react-i18next';
import iconImage from '@/assets/weekly score.svg';
import sleepIcon from '@/assets/sleep.svg';
import exerciseIcon from '@/assets/exercise.svg';
import dietaryIcon from '@/assets/dietary .svg';

interface BottmCardProps {
	hexColor: string;
	text: string;
	type: string;
	time: number | string;
}

interface HealthInfo {
	score: number;
	tags: { text: string }[];
	sleepTime: number;
	frequency: number | string;
	calorie: number | string;
	weeklySummaryText: string;
}

// 页面信息
const PAGE_OPTION = {
	pageId: 'weekly-health-score',
	pageName: '周报健康得分',
	debug: import.meta.env.DEV,
};

// 根据type返回对应的icon
function getIcon(type: string) {
	switch (type) {
		case 'sleep':
			return sleepIcon;
		case 'exercise':
			return exerciseIcon;
		case 'dietary':
			return dietaryIcon;
		default:
			return sleepIcon;
	}
}

// 根据type和text返回对应的时间或次数
function getTypeTime(type: string, time: number | string) {
	switch (type) {
		case 'sleep':
			const hours = Math.floor((time as number) / 60);
			const minutes = (time as number) % 60;
			return (
				<>
					<div>
						<span style={{ display: hours === 0 ? 'none' : 'inline' }}>
							<span className="text-[45px] text-[#FB923CFF] font-bold mr-2">{hours || 0}</span>
							<span className="text-[30px] text-[#161718FF]">h</span>
						</span>
						<span style={{ display: minutes === 0 ? 'none' : 'inline' }}>
							<span className="text-[45px] text-[#FB923CFF] font-bold mr-2">{minutes || 0}</span>
							<span className="text-[30px] text-[#161718FF]">min</span>
						</span>
					</div>
				</>
			);
		case 'exercise':
			return (
				<>
					<div>
						<span className="text-[45px] text-[#FB923CFF] font-bold mr-2">{+time || 0}</span>
						<span className="text-[30px] text-[#161718FF]">times</span>
					</div>
				</>
			);
		case 'dietary':
			return (
				<>
					<div>
						<span className="text-[45px] text-[#FB923CFF] font-bold mr-2">{time || 0}</span>
						<span className="text-[30px] text-[#161718FF]">kcal</span>
					</div>
				</>
			);
		default:
			return '';
	}
}

// 底部卡片组件
function BottmCard({ hexColor, text, type, time }: BottmCardProps) {
	return (
		<div
			className={`w-65 p-10 rounded-[30px] flex flex-col items-center justify-center  box-border ${hexColor}`}
		>
			{/* icon */}
			<div>
				<img src={getIcon(type)} alt="" />
			</div>
			{/* 文字 */}
			<div className="text-[#918D8AFF] my-2.5 text-[24px]">{text}</div>
			{/* 时间 次数 .. */}
			<div className="flex items-center justify-center">{getTypeTime(type, time)}</div>
		</div>
	);
}

export function WeeklyHealthScorePage() {
	const { t } = useTranslation();
	const [healthData, setHealthData] = useState<HealthInfo>({} as HealthInfo);
	const { onData } = useNativeBridge(PAGE_OPTION);

	useEffect(() => {
		onData((data) => {
			console.log('收到数据:', data);
			if (data && typeof data === 'string') {
				try {
					const jsonData = JSON.parse(data);
					setHealthData(jsonData.score);
				} catch (error) {
					console.error('解析JSON数据失败:', error);
				}
			} else if (Object.prototype.toString.call(data) === '[object Object]') {
				setHealthData(data as HealthInfo);
			} else {
				console.error('未知数据格式:', data);
			}
		});
	}, [onData]);

	return (
		<WidgetLayout className="bg-[#FFFFFF1A]">
			<div
				className={`w-full min-h-75 p-15 ${healthData.tags ? '' : 'flex items-center justify-center'}`}
			>
				{healthData.tags ? (
					<div className="w-full bg-amber-950 rounded-[30px]">
						{/* 睡眠分数相关信息 */}
						<div className="bg-[#FB923CFF] p-15 h-4/5 rounded-t-[30px]">
							{/* 标题 */}
							<div className="flex items-center justify-between">
								<div className="flex items-center justify-center">
									<img src={iconImage} />
									<span className="text-[#FFFFFF] font-bold text-[36px] ml-4.5 mr-30">
										{t('page.weeklyHealth.weeklyHealthScore')}
									</span>
								</div>
								{healthData.weeklySummaryText && (
									<div
									className="h-13.5 w-66 p-6 text-[24px] flex justify-center items-center rounded-[18px] bg-[#fca863] text-white border border-white"
								>
									{healthData?.weeklySummaryText || ''}
								</div>)}
							</div>
							{/* 分数展示 */}
							<div>
								<span className="text-[#FFFFFF] font-bold text-[150px]">
									{healthData?.score || 0}
								</span>
								<span className="text-[#FFFFFF] text-[30px]">/100</span>
							</div>
							{/* 标签 */}
							<div>
								{healthData?.tags?.map((tag) => (
									<span
										className="w-75 h-13.5 px-6 py-4.5 text-white bg-[#fca863] rounded-[18px] mr-2.5 text-[24px]"
										key={tag.text}
									>
										{tag.text}
									</span>
								))}
							</div>
						</div>
						{/* 时间 */}
						<div className="w-full flex justify-between h-1/5 p-7.5 rounded-b-[30px] bg-white">
							<BottmCard
								hexColor="bg-[#A27EFF26]"
								text={t('page.weeklyHealth.sleepDuration')}
								type="sleep"
								time={healthData.sleepTime}
							/>
							<BottmCard
								hexColor="bg-[#B8DBFF4D]"
								text={t('page.weeklyHealth.exercise')}
								type="exercise"
								time={healthData.frequency}
							/>
							<BottmCard
								hexColor="bg-[#B1EDB333]"
								text={t('page.weeklyHealth.dietary')}
								type="dietary"
								time={healthData.calorie}
							/>
						</div>
					</div>
				) : (
					<Loader2 className="w-10 h-10 text-[#FB923CFF] animate-spin" />
				)}
			</div>
		</WidgetLayout>
	);
}
