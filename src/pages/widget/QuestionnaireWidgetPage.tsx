import { WidgetLayout } from '@/layouts/WidgetLayout';
import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/services/api';

// 问卷问题
interface QuestionItem {
	_id: string;
	question_text: string;
	question_type: string;
	is_multi_select: boolean;
	sort_order: number;
	status: number;
	language: string;
	create_time: string;
	update_time: string;
	createBy: string;
	updateBy: string;
	max_select_count: number;
	options: OptionItem[];
}

// 问卷选项
interface OptionItem {
	option_id: string;
	option_text: string;
	sort_order: number;
	is_input_enabled: boolean;
}

// 选项选择
type ChooseItem = OptionItem & {
	target: HTMLElement | null;
	value?: string;
};

export function QuestionnaireWidgetPage() {
	const cardRef = useRef<HTMLDivElement>(null);
	const [questions, setQuestions] = useState<QuestionItem[]>([]);
	const [moveDistance, setMoveDistance] = useState<number>(0);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
	const [isShowInput, setIsShowInput] = useState<boolean[]>([]);
	const [choose, setChoose] = useState<
		Map<
			string,
			{
				maxChooseCount: number;
				choose: ChooseItem[];
			}
		>
	>(new Map());
	const newQuestionIndexRef = useRef<number>(1);
	const isComplete = useRef<boolean>(false);

	// 更新选择状态的辅助函数
	const updateChoose = (questionId: string, newChoose: ChooseItem[]) => {
		const newChooseMap = new Map(choose);
		const questionInfo = newChooseMap.get(questionId);
		if (questionInfo) {
			newChooseMap.set(questionId, {
				...questionInfo,
				choose: newChoose,
			});
			setChoose(newChooseMap);
		}
	};

	// 获取最新的问题索引
	useEffect(() => {
		newQuestionIndexRef.current = currentQuestionIndex;
	}, [currentQuestionIndex]);
	// 获取问卷和问题
	useEffect(() => {
		try {
			// 获取问卷列表
			apiClient({
				method: 'GET',
				url: '/questionnaire/list',
			}).then((res) => {
				const result = res.data.data.list;
				if (result) {
					setQuestions(result);
					// 初始化每个问题的输入框显示状态
					const newIsShowInput = result.map(() => false);
					setIsShowInput(newIsShowInput);
					// 初始化选择状态
					const newChooseMap = new Map();
					result.forEach((question: QuestionItem, index: number) => {
						const isMultiSelect = question.is_multi_select;
						const MaxSelectCount = question.max_select_count;
						const maxChooseCount = isMultiSelect
							? !MaxSelectCount || MaxSelectCount === 0
								? -1
								: MaxSelectCount
							: 1;
						newChooseMap.set(question._id, {
							maxChooseCount,
							choose: [],
						});
					});
					setChoose(newChooseMap);
				}
			});
		} catch (error) {
			console.log('获取问卷列表失败');
		}
	}, []);

	// 提交问题答案
	const submitQuestion = () => {
		console.log('submit question answers');
		for (const [key, value] of choose.entries()) {
			console.log('question id:', key, 'answers:', value);
		}
	};

	// 下一个问题
	const nextQuestion = (e: any) => {
		if (isComplete.current) {
			submitQuestion();
			return;
		}

		// 计算下一个问题的索引
		const nextIndex = currentQuestionIndex + 1;

		// 如果是最后一个问题且点击的是Done按钮，提交问卷
		if (currentQuestionIndex === questions.length - 1 && e.target.innerText === 'Done') {
			submitQuestion();
			return;
		}

		// 检查是否超过最后一个问题
		if (nextIndex >= questions.length) {
			return;
		}

		// 更新当前问题索引
		setCurrentQuestionIndex(nextIndex);

		// 更新移动距离，除了最后一个问题外都更新
		if (cardRef.current && nextIndex < questions.length) {
			setMoveDistance(moveDistance + cardRef.current.offsetWidth);
		}
	};
	// 上一个问题
	const previousQuestion = (e: React.MouseEvent<HTMLSpanElement>) => {
		isComplete.current = false;
		if (cardRef.current && currentQuestionIndex > 0) {
			// 更新当前问题索引
			setCurrentQuestionIndex(currentQuestionIndex - 1);
			// 更新移动距离
			setMoveDistance(moveDistance - cardRef.current.offsetWidth);
		}
	};

	// 选中选项
	const addActive = (e: any) => {
		const target = e.target as HTMLElement;
		// 使用dataset question index代替currentQuestionIndex，以修复back按钮问题
		const questionIndex = Number(target.dataset.question_index);
		const currentQuestion = questions[questionIndex];
		if (!currentQuestion) return;

		const questionId = currentQuestion._id;
		const chooseInfo = choose.get(questionId);
		if (!chooseInfo || !questionId) return;

		const { maxChooseCount } = chooseInfo;
		const isInputEnabled = e.target.dataset.is_input_enabled === 'true';
		const optionIndex = Number(e.target.dataset.option_index);
		const optionId = e.target.dataset.option_id;
		const option = currentQuestion.options[optionIndex];

		// 获取所有选项元素，使用实际的questionIndex
		const optionElements = document.querySelectorAll(`[data-question_index="${questionIndex}"]`);

		// 检查当前选项是否已被选择
		const isSelected = target.classList.contains('bg-[#FFCF241A]!');

		// 创建新的选择数组，避免直接修改状态
		let newChoose = [...chooseInfo.choose];

		if (isSelected) {
			// 取消选择当前选项
			target.classList.remove('bg-[#FFCF241A]!');
			target.classList.remove('border-orange-500!');

			// 更新选择数组
			const index = newChoose.findIndex((item) => item.option_id === optionId);
			if (index !== -1) {
				// 检查被删除的选项是否带输入框
				const removedItem = newChoose[index];
				if (removedItem.is_input_enabled) {
					const newIsShowInput = [...isShowInput];
					newIsShowInput[questionIndex] = false;
					setIsShowInput(newIsShowInput);
				}
				newChoose.splice(index, 1);
			}
		} else {
			// 添加选择
			// 处理maxChooseCount限制：如果当前选择数量已经达到或超过maxChooseCount，先删除最后一个选项
			if (maxChooseCount > 0 && newChoose.length >= maxChooseCount) {
				// 删除最后一个选择的选项
				const lastItem: ChooseItem | undefined = newChoose.pop();
				if (lastItem && lastItem.target) {
					// 移除被删除元素的样式类
					lastItem.target.classList.remove('bg-[#FFCF241A]!');
					lastItem.target.classList.remove('border-orange-500!');
					// 如果删除的选项是带输入框的，需要关闭输入框
					if (lastItem.is_input_enabled) {
						const newIsShowInput = [...isShowInput];
						newIsShowInput[questionIndex] = false;
						setIsShowInput(newIsShowInput);
					}
				}
			}

			// 给当前选项添加选中样式
			target.classList.add('bg-[#FFCF241A]!');
			target.classList.add('border-orange-500!');

			// 添加到选择数组
			newChoose.push({ target, ...option });

			// 如果是带输入框的选项，显示输入框
			if (isInputEnabled) {
				const newIsShowInput = [...isShowInput];
				newIsShowInput[questionIndex] = true;
				setIsShowInput(newIsShowInput);
			}

			// 单选模式处理：无论是否带输入框，只要是单选模式就执行
			if (maxChooseCount === 1) {
				// 单选模式：移除除当前选项外所有选项的选中样式
				optionElements.forEach((element) => {
					const el = element as HTMLElement;
					if (el !== target) {
						el.classList.remove('bg-[#FFCF241A]!');
						el.classList.remove('border-orange-500!');
					}
				});
				// 确保选择数组中只有当前选项
				newChoose = [{ target, ...option }];
			}
		}

		// 只有在不是最后一个问题且是单选的情况下才直接跳转
		if (maxChooseCount === 1 && questionIndex < questions.length - 1) {
			// 先更新选择状态，然后再跳转
			updateChoose(questionId, newChoose);

			// 直接处理跳转逻辑，避免nextQuestion函数的闭包问题
			if (cardRef.current) {
				// 更新当前问题索引
				setCurrentQuestionIndex(questionIndex + 1);
				// 更新移动距离
				setMoveDistance(moveDistance + cardRef.current.offsetWidth);
				// 重置isComplete状态
				isComplete.current = false;
			}
			return;
		}

		// 更新选择状态
		updateChoose(questionId, newChoose);
	};

	// 用户输入
	const inputValue = (e: any, questionIndex: number, optionId: string) => {
		const value = e.target.value;
		const questionId = questions[questionIndex]?._id;
		const chooseInfo = choose.get(questionId);

		if (chooseInfo) {
			// 只更新当前选中的带输入框的选项值
			const targetItem = chooseInfo.choose.find(
				(item) => item.option_id === optionId && item.is_input_enabled,
			);
			if (targetItem) {
				// 创建新的选择数组，避免直接修改状态
				const newChoose = [...chooseInfo.choose];
				const targetIndex = newChoose.findIndex(
					(item) => item.option_id === optionId && item.is_input_enabled,
				);
				if (targetIndex !== -1) {
					newChoose[targetIndex] = {
						...newChoose[targetIndex],
						value: value,
					};
					// 更新选择状态
					updateChoose(questionId, newChoose);
				}
			}
		}
	};

	// 渲染问卷问题和选项
	const questionsItems = questions.map((question, questionIndex) => {
		// 获取当前选中的带输入框的选项
		const chooseInfo = choose.get(question._id);
		const selectedInputOption = chooseInfo?.choose.find((item) => item.is_input_enabled);
		const selectedOptionId = selectedInputOption?.option_id;

		// 检查是否可以继续到下一题
		const canProceed = () => {
			const chooseInfo = choose.get(question._id);
			if (!chooseInfo || chooseInfo.choose.length === 0) {
				return false;
			}

			// 检查所有选中的选项
			for (const item of chooseInfo.choose) {
				// 如果是带输入框的选项，必须有输入值
				if (item.is_input_enabled) {
					// 检查value是否存在且不为空字符串
					if (!item.value || item.value.trim() === '') {
						return false;
					}
				}
			}
			return true;
		};

		const isDisabled = !canProceed();
		const buttonClass = isDisabled
			? 'bg-[#ccc] cursor-not-allowed'
			: 'bg-gradient-to-br from-[#FB923C] to-[#FE6E00] cursor-pointer';

		return (
			<div
				key={question._id}
				className="w-full flex flex-nowrap shrink-0"
				style={{
					transform: `translateX(-${moveDistance}px)`,
					transition: 'transform 0.5s ease',
				}}
			>
				<div className={`w-full shrink-0 bg-clip-content`} ref={cardRef}>
					{/* 问卷问题 */}
					<div className="my-4 sm:my-6 md:my-8 lg:my-11">
						<div
							className="w-[calc(100%-1.875rem)] text-2xl sm:text-3xl md:text-4xl h-24 sm:h-30 md:h-36 flex items-center rounded-full border-gray-50 bg-white ml-auto pl-8 sm:pl-12 md:pl-16 whitespace-nowrap text-ellipsis relative custom-before mr-2 custom-drop-shadow mb-2"
							title={question.question_text}
						>
							{question.question_text}
						</div>
					</div>

					{/* 问卷选项 */}
					<div className="w-full bg-[#F2F1EF]  option-card  p-[60px]">
						<div className="w-full">
							<div>
								<span className="ml-4 sm:ml-8 md:ml-14 text-xl sm:text-2xl md:text-3xl text-[#918D8A]">
									{question.is_multi_select ? 'Multiple choice' : 'Single choice'}
								</span>
							</div>
							<div className="w-full space-y-4">
								{/* 第一行：只显示选项 */}
								<div className="w-full grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
									{question.options.map((option, optionIndex) => (
										<span
											key={option.option_id}
											onClick={addActive}
											data-question_index={questionIndex}
											data-option_index={optionIndex}
											data-option_id={option.option_id}
											data-is_input_enabled={option?.is_input_enabled || 'false'}
											className="w-full text-xl sm:text-2xl md:text-3xl flex flex-auto items-center justify-center bg-white border-4 border-white mt-4 sm:mt-6 md:mt-8 py-4 sm:py-8 md:py-[40px] px-4 sm:px-8 md:px-[45px] border-radius-25 transition-all"
										>
											{option.option_text}
										</span>
									))}
								</div>

								{/* 第二行（如果需要）：只显示当前选中的带输入框的选项对应的输入框 */}
								{selectedOptionId && isShowInput[questionIndex] && (
									<div className="w-full flex items-center px-4 sm:px-8 md:px-12 mt-4 sm:mt-6 md:mt-8 h-24 sm:h-28 md:h-32 bg-white rounded-full">
										<input
											onInput={(e) => inputValue(e, questionIndex, selectedOptionId)}
											className="w-full placeholder:text-xl sm:placeholder:text-2xl md:placeholder:text-3xl h-full text-xl sm:text-2xl md:text-3xl overflow-hidden"
											type="text"
											placeholder="Please write your conditions here"
										/>
									</div>
								)}
							</div>
						</div>
					</div>
					{/* next按钮 */}
					<div className="mt-16 sm:mt-24 md:mt-36 mb-4 sm:mb-8 md:mb-14 lg:mb-[14.375rem] relative">
						{currentQuestionIndex ? (
							<button
								onClick={previousQuestion}
								className="w-32 sm:w-48 md:w-64 lg:w-80 h-10 sm:h-14 md:h-18 lg:h-20 rounded-full question-btn-shadow text-black text-sm sm:text-xl md:text-3xl lg:text-4xl bg-white absolute left-0 top-[-50%]"
							>
								back
							</button>
						) : (
							''
						)}
						<div className="text-center text-sm sm:text-xl md:text-2xl lg:text-3xl text-[#918D8AFF]">
							{currentQuestionIndex + 1}/{questions.length}
						</div>
						{/* 显示逻辑：
					   1. 多选题显示按钮
					   2. 最后一个问题（无论类型）显示按钮
					   3. 非最后一个问题的单选题不显示按钮
					*/}
						{question.is_multi_select || questionIndex === questions.length - 1 ? (
							<button
								onClick={nextQuestion}
								className={`w-32 sm:w-48 md:w-64 lg:w-80 h-10 sm:h-14 md:h-18 lg:h-20 question-btn-shadow text-sm sm:text-xl md:text-3xl lg:text-4xl rounded-full text-white absolute right-0 top-[-50%] ${buttonClass}`}
								disabled={isDisabled}
							>
								{questionIndex === questions.length - 1 ? 'Done' : 'Next'}
							</button>
						) : (
							''
						)}
					</div>
				</div>
			</div>
		);
	});
	return (
		<WidgetLayout>
			<div className="w-full py-0 px-[60px] bg-[#F8F8F8FF]">
				<div className="w-full overflow-hidden flex">
					{/* 问题卡片 及其选项 */}
					{questionsItems}
				</div>
			</div>
		</WidgetLayout>
	);
}
