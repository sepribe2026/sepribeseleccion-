
-- Banco de Preguntas de Muestra (Ética y DISC)

-- 1. Preguntas de Ética
INSERT INTO public.evaluation_questions (test_type, question_text, options) VALUES
('ETICA', 'Si descubre que un compañero de trabajo está sustrayendo material de la empresa, ¿cuál es su reacción inmediata?', '[{"text": "Lo reporto inmediatamente a mi superior.", "score": 10}, {"text": "Hablo con mi compañero para que deje de hacerlo.", "score": 5}, {"text": "No hago nada, no es mi problema.", "score": 0}]'::jsonb),
('ETICA', '¿Cómo manejaría información confidencial de un cliente si un conocido le pregunta al respecto?', '[{"text": "Me niego a compartir cualquier información.", "score": 10}, {"text": "Doy solo detalles generales sin nombres.", "score": 3}, {"text": "Comparto la información si confío en la persona.", "score": 0}]'::jsonb),
('ETICA', 'Un superior le pide que omita un procedimiento de seguridad para ahorrar tiempo. ¿Qué hace?', '[{"text": "Me niego educadamente y cumplo el procedimiento.", "score": 10}, {"text": "Lo hago esta vez pero aviso que no volveré a hacerlo.", "score": 0}, {"text": "Sigo la orden sin cuestionar.", "score": -5}]'::jsonb);

-- 2. Preguntas de Perfil DISC
INSERT INTO public.evaluation_questions (test_type, question_text, options) VALUES
('DISC', 'En un grupo de trabajo, usted generalmente es quien:', '[{"text": "Toma el liderazgo y dirige las acciones.", "disc_axis": "D"}, {"text": "Motiva a los demás y mantiene un ambiente alegre.", "disc_axis": "I"}, {"text": "Escucha a todos y busca el consenso.", "disc_axis": "S"}, {"text": "Analiza los datos y asegura que todo sea correcto.", "disc_axis": "C"}]'::jsonb),
('DISC', 'Ante un problema inesperado, su primera reacción es:', '[{"text": "Actuar rápido para resolverlo.", "disc_axis": "D"}, {"text": "Hablar con otros para encontrar ideas.", "disc_axis": "I"}, {"text": "Mantener la calma y seguir la rutina establecida.", "disc_axis": "S"}, {"text": "Revisar las reglas y procedimientos.", "disc_axis": "C"}]'::jsonb);

