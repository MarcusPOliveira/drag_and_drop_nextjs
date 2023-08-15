"use client";
import { useState } from "react";
import {
	DragDropContext,
	Draggable,
	DropResult,
	Droppable,
} from "react-beautiful-dnd";

interface Item {
	id: string;
	content: string;
	value: number;
}

interface Column {
	id: string;
	items: Item[];
	title: string;
	color: string;
}

const items: Item[] = [
	{
		id: "1",
		content: "Item 1",
		value: 100,
	},
	{
		id: "2",
		content: "Item 2",
		value: 50,
	},
	{
		id: "3",
		content: "Item 3",
		value: 75,
	},
];

const initialColumns: Column[] = [
	{
		id: "Coluna_A",
		items: items,
		title: "Em negociação",
		color: "#97e794",
	},
	{
		id: "Coluna_B",
		items: [],
		title: "Pagamento efetuado",
		color: "#8fafec",
	},
	{
		id: "Coluna_C",
		items: [],
		title: "Pedido finalizado",
		color: "#ad6ea8",
	},
];

export default function Home() {
	const [columns, setColumns] = useState<Column[]>(initialColumns);
	const [newItemCounter, setNewItemCounter] = useState<number>(4);
	const [columnFilter, setColumnFilter] = useState<string>("");

	const onDragEnd = (result: DropResult) => {
		// Identificando os IDs das colunas de origem e destino
		const sourceColumnId = result.source.droppableId;
		const destinationColumnId = result?.destination?.droppableId;

		// Encontrando os índices das colunas usando os IDs
		const sourceColumnIndex = columns.findIndex(
			(column) => column.id === sourceColumnId
		);
		const destinationColumnIndex = columns.findIndex(
			(column) => column.id === destinationColumnId
		);

		// Verificando se as colunas de origem e destino foram encontradas
		if (sourceColumnIndex === -1 || destinationColumnIndex === -1) {
			return; // Se uma das colunas não for encontrada, sai da função
		}

		// Obtendo as colunas de origem e destino usando os índices
		const sourceColumn = columns[sourceColumnIndex];
		const destinationColumn = columns[destinationColumnIndex];

		// Encontrando o item arrastado na coluna de origem
		const draggedItem = sourceColumn.items.find(
			(item) => item.id === result.draggableId
		);

		// Verificando se o item arrastado foi encontrado
		if (!draggedItem) {
			return; // Se o item não for encontrado, sai da função
		}

		// Criando uma cópia atualizada das colunas
		const updatedColumns = [...columns];

		// Atualizando o estado de acordo com a lógica de arrastar e soltar
		if (sourceColumnIndex === destinationColumnIndex) {
			// Caso o item seja solto na mesma coluna de origem
			const filteredSourceItems = sourceColumn.items.filter(
				(item) => item.id !== result.draggableId
			);
			filteredSourceItems.splice(
				result?.destination?.index || 0,
				0,
				draggedItem
			);
			updatedColumns[sourceColumnIndex].items = filteredSourceItems;
		} else {
			// Caso o item seja solto em uma coluna de destino diferente
			const filteredSourceItems = sourceColumn.items.filter(
				(item) => item.id !== result.draggableId
			);
			const destinationItems = [...destinationColumn.items];
			destinationItems.splice(result?.destination?.index || 0, 0, draggedItem);

			updatedColumns[sourceColumnIndex].items = filteredSourceItems;
			updatedColumns[destinationColumnIndex].items = destinationItems;
		}

		// Atualizando o estado com as colunas atualizadas
		setColumns(updatedColumns);
	};

	const handleAddItem = () => {
		// Crie um novo item com um ID único
		const newItem = {
			id: newItemCounter.toString(),
			content: `Novo Item ${newItemCounter}`,
			value: 50,
		};

		// Atualize o contador de novos itens
		setNewItemCounter((prevCounter) => prevCounter + 1);

		// Crie uma cópia atualizada das colunas
		const updatedColumns = [...columns];

		// Adicione o novo item à primeira coluna "Em negociação"
		updatedColumns[0].items.push(newItem);

		// Atualize o estado das colunas
		setColumns(updatedColumns);
	};

	const calculateColumnTotal = (columnItems: Item[]): number => {
		return columnItems.reduce((total, item) => total + item.value, 0);
	};

	const handleColumnFilterChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setColumnFilter(event.target.value);
	};

	const filteredColumns = columnFilter
		? columns.filter((column) =>
				column.title.toLowerCase().includes(columnFilter.toLowerCase())
		  )
		: columns;

	return (
		<main className="flex md:py-16 md:px-24">
			<div className="w-full h-auto font-mono flex flex-col rounded-md text-sm lg:flex bg-red-400 gap-4 p-4">
				<div className="flex w-full">
					<input
						type="text"
						placeholder="Filtrar por nome da coluna"
						value={columnFilter}
						onChange={handleColumnFilterChange}
						className="w-56 p-2 border border-gray-300 rounded-md mr-2 text-black"
					/>
					<button
						className="bg-blue-500 p-2 rounded-md"
						onClick={handleAddItem}
					>
						Add item
					</button>
				</div>
				<DragDropContext onDragEnd={onDragEnd}>
					{filteredColumns.map((column) => (
						<div>
							<h1 className="w-[200px]">{column.title}</h1>
							<Droppable
								droppableId={column.id}
								key={column.id}
								direction="horizontal"
							>
								{(provided) => (
									<div
										className="flex items-center h-[120px] md:h-[100px] flex-row"
										ref={provided.innerRef}
									>
										<div
											className="flex flex-row w-full h-full overflow-x-auto rounded-md p-6 md:p-3 gap-4"
											style={{ backgroundColor: column.color }}
										>
											{column.items.map((item, index) => (
												<Draggable
													draggableId={item.id}
													index={index}
													key={item.id}
												>
													{(provided) => (
														<div
															className="flex flex-col items-center justify-center text-center bg-gray-400 rounded-md min-w-[80px] md:w-[80px]"
															style={{ ...provided.draggableProps.style }}
															ref={provided.innerRef}
															{...provided.dragHandleProps}
															{...provided.draggableProps}
														>
															<p>{item.content}</p>
															<p>{item.value},00</p>
														</div>
													)}
												</Draggable>
											))}
											{provided.placeholder}
										</div>
										<div className="flex flex-col w-24 md:w-28 h-full rounded-md bg-gray-200 items-center justify-center">
											<p className="text-black text-center">Valor total</p>
											<p className="text-black">
												R$ {calculateColumnTotal(column.items)},00
											</p>
										</div>
									</div>
								)}
							</Droppable>
						</div>
					))}
				</DragDropContext>
			</div>
		</main>
	);
}
