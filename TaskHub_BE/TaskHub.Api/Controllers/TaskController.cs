using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskHub.Application.DTOs;
using TaskHub.Application.Enums;
using TaskHub.Application.Interfaces;

namespace TaskHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TasksController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetTasks(
            [FromQuery] Guid? categoryId,
            [FromQuery] bool? isCompleted,
            [FromQuery] TaskSortOption sortBy = TaskSortOption.Default,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 8)
        {
            var tasks = await _taskService.GetAllTasksAsync(CurrentUserId, categoryId, isCompleted, sortBy, pageNumber, pageSize);
            return Ok(tasks);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetTask(Guid id)
        {
            var task = await _taskService.GetTaskByIdAsync(CurrentUserId, id);

            if(task == null)
            {
                return NotFound();
            }

            return Ok(task);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
        {
            var task = await _taskService.CreateTaskAsync(CurrentUserId, dto);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskDto dto)
        {
            await _taskService.UpdateTaskAsync(CurrentUserId, id, dto);
            return NoContent();
        }

        [HttpPatch("{id:guid}/complete")]
        public async Task<IActionResult> MarkAsComplete(Guid id)
        {
            await _taskService.MarkAsCompleteAsync(CurrentUserId, id);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            await _taskService.DeleteTaskAsync(CurrentUserId, id);
            return NoContent();
        }
    }
}
