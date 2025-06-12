import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './ayuda.component.html',
  styleUrls: ['./ayuda.component.scss']
})
export class AyudaComponent {
  secciones = [
    {
      titulo: 'Grupos',
      contenido: 'Los grupos te permiten organizar tus gastos compartidos con amigos, familiares o compañeros de trabajo. Puedes crear tantos grupos como necesites y añadir participantes a cada uno.',
      icono: 'people'
    },
    {
      titulo: 'Gastos',
      contenido: 'Registra los gastos de tu grupo especificando quién pagó, cuánto fue el monto y cómo se reparte entre los participantes.',
      icono: 'cash'
    },
    {
      titulo: 'Balances',
      contenido: 'El balance muestra quién debe dinero y a quién. Es una forma rápida de saber cómo están las cuentas en tu grupo.',
      icono: 'wallet'
    },
    {
      titulo: 'Liquidaciones',
      contenido: 'Las liquidaciones te permiten registrar los pagos realizados para saldar deudas entre los participantes del grupo.',
      icono: 'swap-horizontal'
    },
    {
      titulo: 'Métodos de Repartición',
      contenido: 'Existen tres métodos para repartir un gasto: partes iguales (todos pagan lo mismo), porcentaje (cada uno paga un porcentaje del total) o exacto (se especifica cuánto paga cada persona).',
      icono: 'calculator'
    }
  ];
  
  faqs = [
    {
      pregunta: '¿Cómo creo un nuevo grupo?',
      respuesta: 'Ve a la sección "Mis Grupos" y pulsa el botón + para crear un nuevo grupo. Luego, completa el formulario con el nombre y descripción del grupo y añade los participantes.'
    },
    {
      pregunta: '¿Cómo añado un gasto?',
      respuesta: 'Dentro de un grupo, ve a la sección de gastos y pulsa el botón + para añadir un nuevo gasto. Completa la información requerida y selecciona cómo quieres repartir el gasto.'
    },
    {
      pregunta: '¿Cómo veo quién debe dinero a quién?',
      respuesta: 'En la página del grupo, accede a la sección "Balances" para ver un resumen de quién debe dinero y a quién.'
    },
    {
      pregunta: '¿Cómo registro que alguien ha pagado su deuda?',
      respuesta: 'En la sección de liquidaciones, crea una nueva liquidación indicando quién paga, a quién y el monto.'
    },
    {
      pregunta: '¿Puedo eliminar un gasto mal registrado?',
      respuesta: 'Sí, puedes eliminar un gasto accediendo a su detalle y pulsando el botón de papelera.'
    }
  ];
}
